
const deleteData = (delUrl, datatableId) => {
    let datatable = `#${datatableId}`;
    if (confirm('Are you sure you want to mark this employee as deleted?')) {
        $.ajax({
            url: delUrl,
            method: 'PATCH',  // Use PATCH to update 
            headers: {
                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') // Include CSRF token
            },
            contentType: "application/json", // Ensure proper content type
            dataType: "json", // Expect JSON response
            success: function (response) {
                if (response.success) {
                    $("meta[name='csrf-token']").attr("content", response.csrfToken); // Update CSRF token
                    $(datatable).DataTable().ajax.reload(); // Reload DataTable
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error);
                alert("An error occurred: " + xhr.responseJSON?.message || "Failed to delete product.");
            }
        });
    }
}



// common fynction of update image for Profile and Product 

const systemImageUpdate = (formData, dataUrl) => {
    $.ajax({
    url: dataUrl, // Your server-side endpoint
    method: 'POST',
    data: formData,
    headers: {
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') // Include CSRF token
    },
    contentType: "application/json", // Ensure proper content type
    dataType: "json", // Expect JSON response
    contentType: false,
    processData: false,
    success: function (response) {
        if (response.status === 'success') {
            // Update the profile image on success
            $('#fileData').attr('src', response.thumbnailImage);
            $("meta[name='csrf-token']").attr("content", response.csrfToken); // Update CSRF token
        } else {
            alert('Error uploading image: ' + response.message);
        }
    },
    error: function (error) {
        console.log("======error", error.message);
        // alert('Error uploading image');
        console.error(error);
    } 
});
}