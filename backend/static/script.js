// Custom JavaScript for Snidan Price Monitor

document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss flash messages after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        const passwordInput = document.getElementById('password');
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            } else {
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            }
        });
    }

    // Product search functionality
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        const productsTable = document.getElementById('productsTable');
        const tableRows = productsTable ? productsTable.querySelectorAll('tbody tr') : [];
        
        productSearch.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            
            tableRows.forEach(function(row) {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
        
        // Clear search button
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', function() {
                productSearch.value = '';
                tableRows.forEach(function(row) {
                    row.style.display = '';
                });
            });
        }
    }

    // Size selector for price history
    const sizeSelector = document.getElementById('sizeSelector');
    if (sizeSelector) {
        const sizeHistories = document.querySelectorAll('.size-history');
        
        sizeSelector.addEventListener('change', function() {
            const selectedSize = this.value;
            
            sizeHistories.forEach(function(history) {
                if (history.id === selectedSize) {
                    history.style.display = '';
                } else {
                    history.style.display = 'none';
                }
            });
        });
    }

    // Confirm delete modal
    const deleteButtons = document.querySelectorAll('[data-bs-toggle="modal"][data-bs-target^="#deleteModal"]');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            
            const modal = document.querySelector(this.getAttribute('data-bs-target'));
            if (modal) {
                const productNameElement = modal.querySelector('.product-name');
                const productIdElement = modal.querySelector('.product-id');
                const deleteForm = modal.querySelector('form');
                
                if (productNameElement) {
                    productNameElement.textContent = productName || 'Unknown';
                }
                
                if (productIdElement) {
                    productIdElement.textContent = productId;
                }
                
                if (deleteForm && productId) {
                    deleteForm.action = `/delete_product/${productId}`;
                }
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });

    // Tooltips initialization
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}); 