// Initialize DataTable with default settings
const order = [[0, 'desc']];
const columns = [
    { data: 'created_at' },
    { data: 'createdBy'},
    { data: 'title' },
    { data: 'price' },
    { data: 'product_number' },
    
    {
        data: 'status',
        render: function (data, type, row) {
            return `<button class="btn btn-success">${data ? 'Active' : 'Pending'}</button>`;

        }
    },
    {
        data: 'id',
        render: function (data, type, row) {
            return `
            <a class="btn btn-sm btn-info" href="/products/view-product/${data}?type=view">View</a>
            <a class="btn btn-sm btn-edit" href="/products/edit-product/${data}?type=edit">Edit</a>
            <button class="btn btn-sm btn-danger delete-product" data-id="${data}">Delete</button>`;
        }
    }
];
initializeDataTable('#products-table', '/products/ajax-list', columns, order);


// Handle Delete Button Click
$(document).on('click', '.delete-product', function () {
    let productId = $(this).data('id');  // Get employee ID from the button's data-id attribute
    let datatableId = 'products-table';
    let url =  `/products/delete-product/${productId}`;
    deleteData(url, datatableId);
});
