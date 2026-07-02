# ExpoBarCodeReaderTest

## O projektu

Ovaj projekat je pravljen na poslu u teretani, sa ciljem znacajnog ubrzanja procesa popisa inventara.

Sistem omogucava da se inventar skenira preko mobilne aplikacije (bar kod), sinhronizuje sa backend servisom i prati kroz organizovan tok rada za magacin i artikle.

## Glavne funkcionalnosti

- Skeniranje bar kodova putem mobilne (Expo) aplikacije.
- Prikaz i upravljanje stavkama inventara kroz vise ekrana (inventory, reports, account).
- Backend API za rad sa proizvodima, magacinima i stavkama magacina.
- Automatizovano dohvatanje sesije za spoljasnji sistem (Upfit) preko Playwright-a.
- Generisanje TypeScript klijenta iz OpenAPI specifikacije backend-a.

## Struktura projekta

```
backend/         FastAPI + SQLModel servis
mobile/          Expo React Native aplikacija
```

## Tehnologije

- Mobile: Expo, React Native, Expo Router, TypeScript, NativeWind, React Query
- Backend: FastAPI, SQLModel, Uvicorn, Playwright, PyMySQL
- Integracija: OpenAPI code generation (`openapi-ts`)

## Pokretanje projekta lokalno

### 1) Backend

Prelazak u backend folder:

```bash
cd backend
```

Instalacija zavisnosti:

```bash
pip install -r requirements.txt
```

Pokretanje API servera:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

API dokumentacija nakon pokretanja:

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

Opcionalno, backend moze da se pokrene i kroz Docker:

```bash
docker build -t inventory-backend ./backend
docker run --rm -p 8000:8000 inventory-backend
```

### 2) Mobile aplikacija

Prelazak u mobile folder:

```bash
cd mobile
```

Instalacija Node paketa:

```bash
npm install
```

Pokretanje Expo okruzenja:

```bash
npm run start
```

Korisne skripte:

- `npm run android` - pokretanje na Android uredjaju/emulatoru
- `npm run ios` - pokretanje na iOS simulatoru
- `npm run web` - pokretanje web verzije
- `npm run lint` - lint provera

## Generisanje API klijenta

Iz foldera `mobile/`:

```bash
npm run generate-client-dev
```

Za produkcioni endpoint:

```bash
npm run generate-client-prod
```

Generisani klijent se nalazi u folderu `mobile/backend-client/`.

## Napomena

Primarna svrha projekta je prakticna primena u radu teretane: da proces popisa inventara bude brzi, tacniji i jednostavniji za svakodnevno koriscenje.
