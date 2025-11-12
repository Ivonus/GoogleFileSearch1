"""
Test script per verificare gli endpoint della chat
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_chat_query():
    """Test dell'endpoint /api/chat/query"""
    print("\n" + "="*50)
    print("TEST: Chat Query")
    print("="*50)
    
    url = f"{BASE_URL}/chat/query"
    payload = {
        "query": "Hai informazioni sulle barriere a vapore?",
        "results_count": 25
    }
    
    print(f"\nURL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response:")
        
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        if data.get('success'):
            chunks = data.get('relevant_chunks', [])
            print(f"\n✓ Trovati {len(chunks)} chunks rilevanti")
            
            if chunks:
                print("\nPrimo chunk:")
                first_chunk = chunks[0]
                print(f"  - Score: {first_chunk.get('chunkRelevanceScore', 0)}")
                print(f"  - Documento: {first_chunk.get('source_document', 'N/A')}")
                chunk_obj = first_chunk.get('chunk', {})
                chunk_data = chunk_obj.get('data', {})
                text = chunk_data.get('stringValue', '')
                print(f"  - Testo (primi 200 char): {text[:200]}...")
        else:
            print(f"\n✗ Errore: {data.get('error')}")
            
        return data
        
    except Exception as e:
        print(f"\n✗ Errore durante la richiesta: {str(e)}")
        return None


def test_chat_generate(relevant_chunks):
    """Test dell'endpoint /api/chat/generate"""
    if not relevant_chunks:
        print("\n⚠ Nessun chunk disponibile per testare la generazione")
        return
    
    print("\n" + "="*50)
    print("TEST: Chat Generate")
    print("="*50)
    
    url = f"{BASE_URL}/chat/generate"
    payload = {
        "query": "Hai informazioni sulle barriere a vapore?",
        "relevant_chunks": relevant_chunks[:5],  # Usa solo i primi 5
        "model": "gemini-2.5-flash"
    }
    
    print(f"\nURL: {url}")
    print(f"Chunks utilizzati: {len(payload['relevant_chunks'])}")
    
    try:
        response = requests.post(url, json=payload)
        print(f"\nStatus Code: {response.status_code}")
        
        data = response.json()
        
        if data.get('success'):
            print(f"\n✓ Risposta generata con successo")
            print(f"\nRisposta dell'AI:")
            print("-" * 50)
            print(data.get('response', ''))
            print("-" * 50)
        else:
            print(f"\n✗ Errore: {data.get('error')}")
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
    except Exception as e:
        print(f"\n✗ Errore durante la richiesta: {str(e)}")


if __name__ == "__main__":
    print("\n🧪 TEST DEGLI ENDPOINT DELLA CHAT")
    
    # Test 1: Query
    query_result = test_chat_query()
    
    # Test 2: Generate (solo se la query ha successo)
    if query_result and query_result.get('success'):
        relevant_chunks = query_result.get('relevant_chunks', [])
        test_chat_generate(relevant_chunks)
    
    print("\n" + "="*50)
    print("TEST COMPLETATI")
    print("="*50 + "\n")
