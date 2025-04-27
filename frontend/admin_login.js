document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

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
        loginButton.disabled = isLoading;
        buttonText.style.display = isLoading ? 'none' : 'block';
        loadingSpinner.style.display = isLoading ? 'block' : 'none';
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearError(emailError);
        clearError(passwordError);

        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate inputs
        let isValid = true;

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
        }

        if (!isValid) return;

        // Set loading state
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', data.userType);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('adminName', data.name);
                localStorage.setItem('adminEmail', data.email);

                // Redirect to admin dashboard
                window.location.href = 'admin_dashboard.html';
            } else {
                // Handle specific error cases
                if (response.status === 401) {
                    showError(passwordError, 'Invalid email or password');
                } else {
                    showError(emailError, data.message || 'An error occurred. Please try again.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(emailError, 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Add event listeners
    loginForm.addEventListener('submit', handleSubmit);

    // Add input event listeners for real-time validation
    emailInput.addEventListener('input', () => clearError(emailError));
    passwordInput.addEventListener('input', () => clearError(passwordError));
}); 