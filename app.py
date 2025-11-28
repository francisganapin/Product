from flask import Flask
from api.inventory_routes import inventory_bp
from flask_cors import CORS  # Add this import
from models import engine,Base,Product


def create_app():
    app = Flask(__name__)

    # Enable CORS (critical for React frontend)
    CORS(app)

    with app.app_context():
        Base.metadata.create_all(bind=engine)

    # Register your blueprint
    app.register_blueprint(inventory_bp, url_prefix='/api/items')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
