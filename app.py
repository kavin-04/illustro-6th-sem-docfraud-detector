# app.py
from flask import Flask, request, jsonify
from ocrService import register_user, authenticate_user, ocr_image
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    success, message = register_user(data['name'], data['email'], data['password'])
    if success:
        return jsonify({'message': message, 'name': data['name']}), 201
    return jsonify({'message': message}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    success, message, name = authenticate_user(data['email'], data['password'])
    if success:
        return jsonify({'message': message, 'name': name}), 200
    return jsonify({'message': message}), 401

@app.route('/api/ocr', methods=['POST'])
def ocr():
    # In a real app, you would check authentication here
    # For example with JWT tokens or session cookies
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Save the file temporarily
    file_path = f"temp_{file.filename}"
    file.save(file_path)
    
    # Process with OCR
    result = ocr_image(file_path, authenticated=True)
    
    return jsonify({'result': result}), 200

if __name__ == '__main__':
    app.run(debug=True)