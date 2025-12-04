// form-security.js
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        maxSubmitsPerHour: 5,
        minMessageLength: 10,
        maxMessageLength: 1000,
        allowedServices: ['diagnostic', 'reparation', 'carrosserie', 'entretien', 'pieces']
    };
    
    // Stockage local pour suivre les soumissions
    const getSubmissionCount = () => {
        const data = localStorage.getItem('gomotor_submissions');
        return data ? JSON.parse(data) : { count: 0, timestamp: Date.now() };
    };
    
    const updateSubmissionCount = () => {
        const now = Date.now();
        const oneHourAgo = now - 3600000; // 1 heure en millisecondes
        
        let data = getSubmissionCount();
        
        // Réinitialiser si plus d'une heure
        if (data.timestamp < oneHourAgo) {
            data = { count: 1, timestamp: now };
        } else {
            data.count++;
            data.timestamp = now;
        }
        
        localStorage.setItem('gomotor_submissions', JSON.stringify(data));
        return data.count;
    };
    
    // Validation principale
    const initFormSecurity = () => {
        const form = document.querySelector('.quote');
        if (!form) return;
        
        // Ajouter un champ honeypot si non existant
        if (!form.querySelector('#website')) {
            const honeypot = document.createElement('div');
            honeypot.style.cssText = 'position: absolute; left: -5000px; opacity: 0;';
            honeypot.innerHTML = `
                <label for="website">Site web</label>
                <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
            `;
            form.insertBefore(honeypot, form.firstChild);
        }
        
        // Gestionnaire de soumission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Vérifier le honeypot
            const websiteField = form.querySelector('#website');
            if (websiteField && websiteField.value.trim() !== '') {
                console.warn('Soumission suspecte détectée (honeypot)');
                alert('Soumission bloquée pour sécurité.');
                return false;
            }
            
            // Vérifier la limite de soumissions
            const submissions = getSubmissionCount();
            if (submissions.count >= CONFIG.maxSubmitsPerHour) {
                alert('Trop de demandes envoyées. Veuillez patienter une heure.');
                return false;
            }
            
            // Valider les données
            if (!validateFormData(form)) {
                return false;
            }
            
            // Mettre à jour le compteur
            updateSubmissionCount();
            
            // Désactiver le bouton
            const submitBtn = form.querySelector('.button_1');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Demande envoyée ✓';
            }
            
            // Soumettre après un court délai
            setTimeout(() => {
                form.submit();
            }, 500);
            
            return true;
        });
        
        console.log('Sécurité du formulaire initialisée');
    };
    
    // Validation des données
    const validateFormData = (form) => {
        const data = {
            nom: form.querySelector('input[name="nom"]').value.trim(),
            telephone: form.querySelector('input[name="telephone"]').value.trim(),
            email: form.querySelector('input[name="email"]').value.trim(),
            service: form.querySelector('select[name="service"]').value,
            message: form.querySelector('textarea[name="message"]').value.trim()
        };
        
        // Valider chaque champ
        const errors = [];
        
        if (data.nom.length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!/^[\+]?[0-9\s\-\(\)]{8,20}$/.test(data.telephone)) {
            errors.push('Numéro de téléphone invalide');
        }
        
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email invalide');
        }
        
        if (!CONFIG.allowedServices.includes(data.service)) {
            errors.push('Service invalide sélectionné');
        }
        
        if (data.message.length < CONFIG.minMessageLength) {
            errors.push(`Le message doit contenir au moins ${CONFIG.minMessageLength} caractères`);
        }
        
        if (data.message.length > CONFIG.maxMessageLength) {
            errors.push(`Le message ne doit pas dépasser ${CONFIG.maxMessageLength} caractères`);
        }
        
        // Afficher les erreurs
        if (errors.length > 0) {
            alert('Veuillez corriger les erreurs suivantes:\n\n' + errors.join('\n'));
            return false;
        }
        
        // Nettoyer les données (protection XSS basique)
        cleanFormData(form);
        
        return true;
    };
    
    // Nettoyage des données
    const cleanFormData = (form) => {
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            if (input.name !== 'email' && input.name !== 'telephone') {
                // Échapper les caractères HTML dangereux
                let value = input.value;
                value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                input.value = value;
            }
        });
    };
    
    // Initialiser quand le DOM est chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormSecurity);
    } else {
        initFormSecurity();
    }
})();