#!/usr/bin/env python3
"""
Script per visualizzare i chunks di un documento
"""
import requests
import os
from dotenv import load_dotenv
import json

# Carica variabili d'ambiente
load_dotenv('../.env')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
FILE_SEARCH_STORE_NAME = os.getenv('FILE_SEARCH_STORE_NAME')
BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

print("=" * 80)
print("Visualizzazione Chunks dei Documenti")
print("=" * 80)
print()

# 1. Lista documenti
print("📋 Recupero lista documenti...")
url = f"{BASE_URL}/{FILE_SEARCH_STORE_NAME}/documents"
headers = {'x-goog-api-key': GEMINI_API_KEY}

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    data = response.json()
    documents = data.get('documents', [])
    
    if not documents:
        print("❌ Nessun documento trovato!")
        exit()
    
    print(f"✅ Trovati {len(documents)} documenti\n")
    
    # Mostra lista documenti
    for i, doc in enumerate(documents, 1):
        print(f"{i}. {doc.get('displayName', 'N/A')}")
        print(f"   Name: {doc.get('name', 'N/A')}")
        print()
    
    # Scegli documento
    doc_index = int(input("Inserisci il numero del documento da analizzare: ")) - 1
    selected_doc = documents[doc_index]
    doc_name = selected_doc.get('name')
    
    print()
    print("=" * 80)
    print(f"📄 Documento: {selected_doc.get('displayName')}")
    print("=" * 80)
    print()
    
    # 2. Lista chunks del documento
    print("🔍 Recupero chunks...")
    chunks_url = f"{BASE_URL}/{doc_name}/chunks"
    
    response = requests.get(chunks_url, headers=headers)
    response.raise_for_status()
    
    chunks_data = response.json()
    chunks = chunks_data.get('chunks', [])
    
    if not chunks:
        print("⚠️ Nessun chunk trovato per questo documento")
        exit()
    
    print(f"✅ Trovati {len(chunks)} chunks\n")
    print("=" * 80)
    
    # Mostra dettagli chunks
    for i, chunk in enumerate(chunks, 1):
        print(f"\n📦 CHUNK {i}/{len(chunks)}")
        print("-" * 80)
        print(f"Name: {chunk.get('name', 'N/A')}")
        print(f"State: {chunk.get('state', 'N/A')}")
        
        # Dati del chunk
        data = chunk.get('data', {})
        string_value = data.get('stringValue', '')
        
        print(f"\n📝 Contenuto (primi 500 caratteri):")
        print(string_value[:500])
        if len(string_value) > 500:
            print(f"\n... [altri {len(string_value) - 500} caratteri]")
        
        print(f"\n📊 Lunghezza totale: {len(string_value)} caratteri")
        print("=" * 80)
    
    # Statistiche
    print("\n📊 STATISTICHE")
    print("-" * 80)
    print(f"Totale chunks: {len(chunks)}")
    
    total_chars = sum(len(chunk.get('data', {}).get('stringValue', '')) for chunk in chunks)
    print(f"Totale caratteri: {total_chars:,}")
    
    avg_chars = total_chars // len(chunks) if chunks else 0
    print(f"Media caratteri per chunk: {avg_chars:,}")
    
    print("\n" + "=" * 80)
    
    # Salva JSON completo
    save = input("\nVuoi salvare i chunks completi in un file JSON? (s/n): ")
    if save.lower() == 's':
        filename = f"chunks_{selected_doc.get('displayName', 'document').replace(' ', '_')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(chunks_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Chunks salvati in: {filename}")
    
except requests.exceptions.RequestException as e:
    print(f"❌ Errore API: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response: {e.response.text}")
except Exception as e:
    print(f"❌ Errore: {e}")
    import traceback
    traceback.print_exc()

print()
