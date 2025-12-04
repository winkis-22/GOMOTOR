// form-validation.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.quote');
    if (!form) return; // Si le formulaire n'existe pas sur la page
    
    console.log('Initialisation de la validation du formulaire...');
    
    // Validation des champs
    const validateForm = () => {
        let isValid = true;
        
        // Validation du nom
        const nameInput = form.querySelector('input[name="nom"]');
        if (nameInput && nameInput.value.trim().length < 2) {
            showError(nameInput, 'Le nom doit contenir au moins 2 caractères');
            isValid = false;
        }
        
        // Validation du téléphone
        const phoneInput = form.querySelector('input[name="telephone"]');
        if (phoneInput) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
            if (!phoneRegex.test(phoneInput.value.trim())) {
                showError(phoneInput, 'Numéro de téléphone invalide');
                isValid = false;
            }
        }
        
        // Validation du message
        const messageInput = form.querySelector('textarea[name="message"]');
        if (messageInput && messageInput.value.trim().length < 10) {
            showError(messageInput, 'Le message doit contenir au moins 10 caractères');
            isValid = false;
        }
        
        return isValid;
    };
    
    // Afficher une erreur pour un champ
    const showError = (input, message) => {
        // Supprimer l'erreur précédente
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Créer et ajouter le message d'erreur
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        error.style.cssText = 'color: #ff3333; font-size: 14px; margin-top: 5px;';
        
        input.parentNode.appendChild(error);
        input.style.borderColor = '#ff3333';
        
        // Focus sur le champ en erreur
        input.focus();
    };
    
    // Supprimer l'erreur d'un champ
    const clearError = (input) => {
        const error = input.parentNode.querySelector('.error-message');
        if (error) {
            error.remove();
        }
        input.style.borderColor = '';
    };
    
    // Écouter la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Empêcher l'envoi immédiat
        
        // Supprimer toutes les erreurs précédentes
        const allErrors = form.querySelectorAll('.error-message');
        allErrors.forEach(error => error.remove());
        
        // Réinitialiser les bordures
        const allInputs = form.querySelectorAll('input, textarea, select');
        allInputs.forEach(input => input.style.borderColor = '');
        
        // Valider le formulaire
        if (validateForm()) {
            // Désactiver le bouton pour éviter les doubles soumissions
            const submitBtn = form.querySelector('.button_1');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi en cours...';
                
                // Réactiver après 5 secondes au cas où
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 5000);
            }
            
            // Soumettre le formulaire
            console.log('Formulaire validé, envoi...');
            form.submit();
        } else {
            console.log('Formulaire invalide');
        }
    });
    
    // Validation en temps réel (optionnel)
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearError(this);
        });
        
        input.addEventListener('blur', function() {
            // Validation basique lors de la perte de focus
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                showError(this, 'Ce champ est requis');
            }
        });
    });
    
    console.log('Validation du formulaire initialisée avec succès');
});