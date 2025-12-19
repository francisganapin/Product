"""
Quick test script to verify the DELETE API works correctly
Run this after starting your Flask server
"""

import requests
import json

BASE_URL = 'http://localhost:5000/api/items'

def test_delete_api():
    print("=" * 60)
    print("DELETE API TEST")
    print("=" * 60)
    
    # Step 1: Get all items
    print("\n1. Fetching all items...")
    response = requests.get(BASE_URL)
    
    if response.status_code == 200:
        items = response.json()
        print(f"✅ Found {len(items)} items")
        
        if not items:
            print("⚠️  No items in database. Add some items first!")
            return
        
        # Use the first item for testing
        test_item = items[0]
        item_id = test_item['id']
        item_name = test_item['name']
        
        print(f"\n2. Testing delete for:")
        print(f"   ID: {item_id}")
        print(f"   Name: {item_name}")
        
        # Step 2: Delete the item
        print(f"\n3. Sending DELETE request...")
        delete_response = requests.delete(f"{BASE_URL}/{item_id}")
        
        print(f"   Status Code: {delete_response.status_code}")
        print(f"   Response: {json.dumps(delete_response.json(), indent=2)}")
        
        if delete_response.status_code == 200:
            print("✅ DELETE request successful!")
            
            # Step 3: Verify deletion
            print(f"\n4. Verifying deletion...")
            verify_response = requests.get(f"{BASE_URL}/{item_id}")
            
            if verify_response.status_code == 404:
                print("✅ Item successfully deleted from database!")
            elif verify_response.status_code == 200:
                print("❌ ERROR: Item still exists in database!")
            else:
                print(f"⚠️  Unexpected status code: {verify_response.status_code}")
                
        elif delete_response.status_code == 404:
            print("⚠️  Item not found (already deleted?)")
        else:
            print(f"❌ DELETE failed with status {delete_response.status_code}")
            
    else:
        print(f"❌ Failed to fetch items. Status: {response.status_code}")
    
    print("\n" + "=" * 60)
    
    # Test deleting non-existent item
    print("\n5. Testing delete of non-existent item...")
    fake_response = requests.delete(f"{BASE_URL}/99999")
    print(f"   Status Code: {fake_response.status_code}")
    print(f"   Response: {json.dumps(fake_response.json(), indent=2)}")
    
    if fake_response.status_code == 404:
        print("✅ Correctly returns 404 for non-existent item!")
    else:
        print(f"⚠️  Expected 404, got {fake_response.status_code}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    try:
        test_delete_api()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to server.")
        print("Make sure your Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ ERROR: {e}")
