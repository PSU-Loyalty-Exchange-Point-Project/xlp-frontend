// document.getElementById('toggle-password').addEventListener('click', function() {
//   let passwordInput = document.getElementById('password-input');
//   let typeAttribute = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
//   passwordInput.setAttribute('type', typeAttribute);
// });

(function($) {

  $(".toggle-password").click(function() {

      $(this).toggleClass("zmdi-eye zmdi-eye-off");
      var input = $($(this).attr("toggle"));
      if (input.attr("type") == "password") {
        input.attr("type", "text");
      } else {
        input.attr("type", "password");
      }
    });

})(jQuery);