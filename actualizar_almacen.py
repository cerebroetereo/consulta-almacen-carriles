import pandas as pd
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
import sys
import os

# CONFIGURACIÓN - CAMBIA AQUÍ
SHEET_ID = "1QJ3f8X_SuwV7B9-jE4yi4AyM-KH2sFIP5jQ0WTu-oLs"
CREDENTIALS_FILE = "service-account.json"  # Descargarás esto después

def actualizar_google_sheets(ruta_csv):
    """Sube CSV a Google Sheets sobrescribiendo datos"""
    
    # Leer CSV local
    print(f"📖 Leyendo {ruta_csv}...")
    df = pd.read_csv(ruta_csv, sep=';', low_memory=False)
    print(f"✅ Cargados {len(df)} carriles")
    
    # Autenticación
    if not os.path.exists(CREDENTIALS_FILE):
        raise FileNotFoundError(f"❌ No encontrado {CREDENTIALS_FILE}. Crea service account primero.")
    
    creds = Credentials.from_service_account_file(CREDENTIALS_FILE, 
                                                scopes=['https://www.googleapis.com/auth/spreadsheets'])
    service = build('sheets', 'v4', credentials=creds)
    
    # Preparar datos para subir (headers + filas)
    body = {
        'values': [df.columns.tolist()] + df.values.tolist()
    }
    
    # Sobrescribir hoja (A1 en adelante)
    result = service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range="A1",
        valueInputOption="RAW",
        body=body
    ).execute()
    
    print(f"✅ Actualizado en Google Sheets: {result.get('updatedCells')} celdas")
    print("🌐 La web se actualizará automáticamente en segundos")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❌ Uso: python actualizar_almacen.py ruta_al_csv.csv")
        sys.exit(1)
    
    ruta_csv = sys.argv[1]
    if not os.path.exists(ruta_csv):
        print(f"❌ No encontrado: {ruta_csv}")
        sys.exit(1)
    
    try:
        actualizar_google_sheets(ruta_csv)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
