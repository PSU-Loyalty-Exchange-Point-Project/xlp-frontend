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

function toggleTransactions() {
  var extraTransactions = document.querySelectorAll('.extra');
  var button = document.getElementById('toggleButton');

  // Check if the first extra transaction is visible
  if (extraTransactions[0].style.display === 'none' || extraTransactions[0].style.display === '') {
      // Show extra transactions
      for (var i = 0; i < extraTransactions.length; i++) {
          extraTransactions[i].style.display = 'block';
      }
      button.textContent = 'Show Less'; // Change button text
  } else {
      // Hide extra transactions
      for (var i = 0; i < extraTransactions.length; i++) {
          extraTransactions[i].style.display = 'none';
      }
      button.textContent = 'Show More'; // Change button text
  }
}
