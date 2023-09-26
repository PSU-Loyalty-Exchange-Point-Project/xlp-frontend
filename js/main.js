document.getElementById('toggle-password').addEventListener('click', function() {
  let passwordInput = document.getElementById('password-input');
  let typeAttribute = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', typeAttribute);
});
