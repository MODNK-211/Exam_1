document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const roomPreferenceInput = document.getElementById('roomPreference');
    const registerButton = document.getElementById('registerButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const roomPreferenceError = document.getElementById('roomPreferenceError');

    // Function to show error message
    const showError = (element, message) => {
        element.textContent = message;
        element.style.display = 'block';
    };

    // Function to clear error message
    const clearError = (element) => {
        element.textContent = '';
        element.style.display = 'none';
    };

    // Function to validate email
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Function to set loading state
    const setLoading = (isLoading) => {
        registerButton.disabled = isLoading;
        buttonText.style.display = isLoading ? 'none' : 'block';
        loadingSpinner.style.display = isLoading ? 'block' : 'none';
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearError(nameError);
        clearError(emailError);
        clearError(passwordError);
        clearError(confirmPasswordError);
        clearError(roomPreferenceError);

        // Get form values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const roomPreference = roomPreferenceInput.value;

        // Validate inputs
        let isValid = true;

        if (!name) {
            showError(nameError, 'Name is required');
            isValid = false;
        }

        if (!email) {
            showError(emailError, 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showError(passwordError, 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showError(passwordError, 'Password must be at least 6 characters long');
            isValid = false;
        }

        if (!confirmPassword) {
            showError(confirmPasswordError, 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordError, 'Passwords do not match');
            isValid = false;
        }

        if (!roomPreference) {
            showError(roomPreferenceError, 'Please select a room preference');
            isValid = false;
        }

        if (!isValid) return;

        // Set loading state
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password,
                    roomPreference 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please log in.');
                window.location.href = 'login.html';
            } else {
                if (response.status === 400 && data.message === 'User already exists') {
                    showError(emailError, 'An account with this email already exists');
                } else {
                    showError(emailError, data.message || 'An error occurred. Please try again.');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError(emailError, 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Add event listeners
    registrationForm.addEventListener('submit', handleSubmit);

    // Add input event listeners for real-time validation
    nameInput.addEventListener('input', () => clearError(nameError));
    emailInput.addEventListener('input', () => clearError(emailError));
    passwordInput.addEventListener('input', () => clearError(passwordError));
    confirmPasswordInput.addEventListener('input', () => clearError(confirmPasswordError));
    roomPreferenceInput.addEventListener('change', () => clearError(roomPreferenceError));
});
