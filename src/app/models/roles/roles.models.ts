export enum Roles {
    student_general, // Refers to any student that uses the application
    vendor_general, // Refers to any vendor user that can complete a transaction. eg. cashier.
    vendor_admin, // Refers to the manager or administrator of a vendor
    busary_general, // Refers to any employee in the bursary that can process transactions and viewing account information
    busary_admin, // Refers to any management of the bursary that can view advanced transaction information
    master, // Refers to any person that has full control of the application
    developer // Refers to any person who is developing the application for use of testing, etc.
}
