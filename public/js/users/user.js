// Initialize DataTable with default settings
const order = [[0, 'desc']];
const columns = [
    { data: 'created_at' },
    { data: 'name' },
    { data: 'email' },
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
            <a class="btn btn-sm btn-info" href="/users/view-user/${data}?type=view">View</a>
            <a class="btn btn-sm btn-edit" href="/users/edit-user/${data}?type=edit">Edit</a>
            <button class="btn btn-sm btn-danger delete-user" data-id="${data}">Delete</button>`;
        }
    }
];
initializeDataTable('#users-table', '/users/ajax-list', columns, order);
// Handle Delete Button Click
$(document).on('click', '.delete-user', function () {
    const userId = $(this).data('id');  // Get employee ID from the button's data-id attribute
    let datatableId = 'users-table';
    let url =  `/users/delete-user/${userId}`;
    deleteData(url, datatableId);
});
