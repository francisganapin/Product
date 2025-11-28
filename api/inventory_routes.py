from flask import Blueprint,request,jsonify
from services.inventory_service import InventoryService


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
        return jsonify({"error","Item not found"}),404
    return jsonify(result),200


@inventory_bp.route("/<item_id>",methods=['PUT'])
def updated_item(item_id):
    data = request.get_json()
    service.update_item(item_id,data)
    return jsonify({'message':'Item updated'}),200

@inventory_bp.route("/<item_id>",methods=['DELETE'])
def delete_item(item_id):
    service.delete_item(item_id)
    return jsonify({'message':'Item deleted'}),200