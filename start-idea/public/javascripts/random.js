$(function(){
   $('#new-post').on('submit', function(e){
        e.preventDefault();
        title = this.
        $.ajax({
            url: "/posts",
            type: "POST",
            data: 'title=' + title + '&' + 'description=' + description
            success: function(data){
                alert("Successfully submitted.")
                $('#new-post').modal('close');
            }
        });
   }); 
});