# sfcc-x README

A beaver will help you to work with an SFCC projects

## Features

- **sf 🦊 extract** in `.js` file copies require of the script

    ```js
    // .../cartridge/scripts/cart/cartHelpers.js

    var cartHelpers = require('*/cartridge/scripts/cart/cartHelpers');
    ```

- **sf 🦊 extract** in `.isml` copies isinclude of the template

    ```html
    <!-- from: .../cartridge/templates/default/account/components/loginForm.isml -->

    <isinclude template="account/components/loginForm">
    ```

- **sf 🦊 extract** in `.properties` copies resource message of the active line

    ```js
    //.../cartridge/templates/resources/address_en_GB.properties on 1st line

    Resource.msg('field.shipping.address.first.name', 'address', null)

    // or

    Resource.msgf('label.orderhistory.vieworderdetails', 'address', null, '{0}');
