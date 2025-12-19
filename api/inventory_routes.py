from flask import Blueprint,request,jsonify
from services.inventory_service import InventoryService
from datetime import datetime,timedelta

inventory_bp = Blueprint('inventory',__name__)


service = InventoryService()



@inventory_bp.route("", methods=["POST"])
def add_item():
    data = request.get_json()
    result = service.add_item(data)
    return jsonify(result), 201

@inventory_bp.route("",methods=['GET'])
def get_items():
    return jsonify(service.get_items()),200

@inventory_bp.route("/<item_id>",methods=['GET'])
def get_item(item_id):
    result = service.get_item(item_id)
    if result is None:
        return jsonify({"error":"Item not found"}),404
    return jsonify(result),200


@inventory_bp.route("/<item_id>",methods=['PUT'])
def updated_item(item_id):
    data = request.get_json()
    service.update_item(item_id,data)
    return jsonify({'message':'Item updated'}),200

@inventory_bp.route("/<item_id>",methods=['DELETE'])
def delete_item(item_id):
    """
    Delete an item by ID.
    
    Returns:
        - 200 if deleted successfully
        - 404 if item not found
        - 500 if server error
    """
    result = service.delete_item(item_id)
    
    # Check if there was an error
    if result.get('error'):
        if 'not found' in result.get('message', '').lower():
            return jsonify({'error': result['message']}), 404
        else:
            return jsonify({'error': result['message']}), 500
    
    # Success
    return jsonify({'message': result['message']}), 200

@inventory_bp.route('/expiring_items', methods=['GET'])
def get_expiring_soon():
    today = datetime.now().date()
    threshold = today + timedelta(days=90)

    expiring_soon = [
        product for product in service.get_items()
        if today < datetime.strptime(product['expirationDate'], '%Y-%m-%d').date() <= threshold
    ]

    already_expired = [
        product for product in service.get_items()
        if datetime.strptime(product['expirationDate'], '%Y-%m-%d').date() <= today 
    ]

    print(expiring_soon)  # Debug: Print filtered products
    return jsonify(
        {
            "expiring_soon":expiring_soon,
            "already_expired":already_expired
        }
    ), 200
