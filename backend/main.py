from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
import logging
from fastapi.middleware.cors import CORSMiddleware
from models import *
from sqlmodel import Session, create_engine
from sqlalchemy.dialects.mysql import insert
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = "mysql+pymysql://root:AQTwxITImwhrEHLLLkQiIqIJkOPQUrMj@trolley.proxy.rlwy.net:35949/railway"
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session


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

@app.post("/init_db")
def init_db():
    SQLModel.metadata.create_all(engine)
    return {"message": "Database initialized"}

def upsert(session: Session, model: type[SQLModel], objects: list[SQLModel] | SQLModel |  None = None):
    if not objects:
        return
    
    if isinstance(objects, list):
        data = [obj.model_dump() for obj in objects] 
    elif isinstance(objects, SQLModel): 
        data = objects.model_dump()
    else:
        return

    stmt = insert(model).values(data)

    update_dict = {
        col.name: stmt.inserted[col.name]
        for col in model.__table__.columns
        if col.name != "id"
    }

    do_update_stmt = stmt.on_duplicate_key_update(update_dict)

    session.exec(do_update_stmt)
    session.commit()

def insert_if_not_exists_bulk(session: Session, model: type[SQLModel], objects: List[SQLModel]):
    if not objects:
        return

    data = [obj.model_dump() for obj in objects]
    stmt = insert(model).values(data)
    stmt = stmt.prefix_with("IGNORE")

    session.exec(stmt)
    session.commit()

@app.post(
    "/products/update_many"
)
def bulk_upsert_products(products: list[Product], session: Session = Depends(get_session)):
    upsert(session, Product, products)

@app.post(
    "/warehouses/update"
)
def upsert_warehouse(warehouse: Warehouse, session: Session = Depends(get_session)):
    upsert(session, Warehouse, warehouse)

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
            club_name = None
            club_id = None
            
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
                    error_element = page.locator(".alert-error").first
                    if error_element.is_visible(timeout=1000):
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
                
                if browser:
                    try:
                        browser.close()
                    except Exception as e:
                        logger.warning(f"Error closing browser: {e}")

                try:
                    url = "https://nonstopfitness.upfit.cloud/reception/dashboard"
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Cookie": f"PHPSESSID={phpsessid}" 
                    }

                    session = requests.Session()
                    response = session.get(url, headers=headers, allow_redirects=True, timeout=10)

                    if (response.url != url):
                        raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Login failed, Check your credentials."
                    )
                    
                    soup = BeautifulSoup(response.text, 'html.parser')
                    page_title_elem = soup.select_one("#club_scope")
                    if page_title_elem:
                        option_el = page_title_elem.find("option")
                        if option_el:
                            club_name = option_el.text.strip()
                            club_id = option_el['value']
                        else:
                            logger.warning("Option element not found inside #club_scope")
                    else:
                        logger.warning(f"Page title element not found. Response length: {len(response.text)}")
                except Exception as e:
                    logger.error(f"Couldn't fetch club name from Dashboard! Exception: {e}")
                
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
                "clubName" : club_name,
                "clubId" : club_id
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