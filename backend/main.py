from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
import logging
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class UpfitAccount(BaseModel):
    username: str = Field(..., min_length=1, description="Username for Upfit account")
    password: str = Field(..., min_length=1, description="Password for Upfit account")


class SessionResponse(BaseModel):
    PHPSESSID: str
    clubName: str | None


class ErrorResponse(BaseModel):
    detail: str
    error_code: str


app = FastAPI(
    title="NSF-Inventory API",
    description="API to retrieve PHP session ID from Upfit",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post(
    "/php_sess_id/",
    response_model=SessionResponse,
    responses={
        200: {"description": "Successfully retrieved session ID", "model": SessionResponse},
        401: {"description": "Invalid credentials", "model": ErrorResponse},
        502: {"description": "Failed to connect to Upfit service", "model": ErrorResponse},
        504: {"description": "Request timed out", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    }
)
def get_php_session_id(upfit_account: UpfitAccount):
    """
    Retrieve PHP session ID by logging into Upfit.
    
    - username: Upfit account username
    - password: Upfit account password

    """
    browser = None
    
    try:
        with sync_playwright() as p:
            phpsessid = None
            clubName = None
            
            try:
                browser = p.chromium.launch(headless=True)
            except Exception as e:
                logger.error(f"Failed to launch browser: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to launch browser"
                )
            
            try:
                page = browser.new_page()
                page.set_default_timeout(10000)  # 30 second timeout
                
                # Navigate to login page
                try:
                    page.goto("https://nonstopfitness.upfit.cloud/", wait_until="domcontentloaded")
                except PlaywrightTimeoutError:
                    logger.error("Timeout while loading Upfit page")
                    raise HTTPException(
                        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                        detail="Timeout while connecting to Upfit service"
                    )
                except Exception as e:
                    logger.error(f"Failed to navigate to Upfit: {e}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Failed to connect to Upfit service"
                    )
                
                # Wait for and fill login form
                try:
                    page.wait_for_selector("#classic-login input", timeout=10000)
                    login_input = page.locator("#classic-login input").nth(0)
                    login_input.fill(upfit_account.username)
                    
                    password_input = page.locator("#classic-login input").nth(1)
                    password_input.fill(upfit_account.password)
                except PlaywrightTimeoutError:
                    logger.error("Login form not found")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Login form not found on Upfit page"
                    )
                except Exception as e:
                    logger.error(f"Error filling login form: {e}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Error filling login form"
                    )
                
                # Submit login form
                try:
                    submit = page.locator("button[type='submit']").first
                    submit.click()
                    
                    # Wait for navigation or response after login
                    page.wait_for_load_state("networkidle", timeout=15000)
                except PlaywrightTimeoutError:
                    logger.warning("Timeout after login click, continuing to check cookies")
                except Exception as e:
                    logger.warning(f"Error during login submission: {e}")
                
                # Check for login error indicators
                try:
                    error_element = page.locator(".error-message, .alert-danger, .login-error").first
                    if error_element.is_visible(timeout=2000):
                        error_text = error_element.text_content() or "Invalid credentials"
                        logger.warning(f"Login error detected: {error_text}")
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid username or password"
                        )
                except PlaywrightTimeoutError:
                    # No error element found, continue
                    pass
                except HTTPException:
                    raise
                except Exception:
                    # No error element, continue
                    pass
                
                # Extract session cookie
                cookies = page.context.cookies("https://nonstopfitness.upfit.cloud")
                for cookie in cookies:
                    if cookie['name'] == 'PHPSESSID':
                        logger.info(f"Found Session ID: {cookie['value'][:8]}...")
                        phpsessid = cookie['value']
                        break

                if not phpsessid:
                    logger.error("PHPSESSID cookie not found - possible login failure")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Login failed - session not created. Check your credentials."
                    )
                
                try:
                    club_name = page.locator(".page-title").first.locator("strong").first.text_content()
                except Exception as e:
                    logger.warning("Couldn`t fetch club name from Dashboard !")
                
                # print(page_title)
                
            finally:
                if browser:
                    try:
                        browser.close()
                    except Exception as e:
                        logger.warning(f"Error closing browser: {e}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "PHPSESSID": phpsessid,
                "clubName" : club_name
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": "healthy"}
    )