// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {
  $("#myButton").on("click", function(event) {
    alert('it worked!')
    }

    $.ajax("/api/cats/" + id, {
      type: "PUT",
      data: newSleepState
    }).then(
      function() {
        console.log("changed sleep to", newSleep);
        // Reload the page to get the updated list
        location.reload();
      }
    )
  })
