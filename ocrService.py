
import pytesseract
from PIL import Image
from werkzeug.security import generate_password_hash, check_password_hash

# In-memory user database (for demo purposes - replace with a real database in production)
users_db = {}

def register_user(name, email, password):
    """Register a new user."""
    if email in users_db:
        return False, "Email already registered"
    
    users_db[email] = {
        'name': name,
        'email': email,
        'password': generate_password_hash(password)
    }
    return True, "Registration successful"

def authenticate_user(email, password):
    """Authenticate an existing user."""
    user = users_db.get(email)
    if not user:
        return False, "Account not found. Please sign up first."
    
    if not check_password_hash(user['password'], password):
        return False, "Invalid credentials"
    
    return True, "Login successful", user['name']

def ocr_image(image_path, authenticated=False):
    """Performs OCR on the image - only for authenticated users."""
    if not authenticated:
        return "Error: Authentication required to use this service"
    
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        return text
    except Exception as e:
        return f"Error during OCR: {str(e)}"