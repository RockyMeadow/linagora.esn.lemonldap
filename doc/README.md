# LemonLDAP

OpenPaaS supports LemonLDAP authentication, if this is the first time you hear
about LemonLDAP, check their [documentation](https://lemonldap-ng.org/documentation)
to explore that awesome software.

## How it works

LemonLDAP protects OpenPaaS behind a proxy, OpenPaaS then authenticates users by
reading HTTP trusted-headers forwarded from LemonLDAP. See more about it
[here](https://lemonldap-ng.org/documentation/latest/configvhost).

When the user logs in to OpenPaaS, the following steps happen:

1/ The user goes to OpenPaaS and is redirected to login page of LemonLDAP

2/ The user enters credentials to log in and is redirected back to OpenPaaS

3/ OpenPaaS reads the trusted-headers forwarded from LemonLDAP, converts it to
OpenPaaS user

4/ If the user is found in trusted-headers, OpenPaaS makes the user authenticated.
It then stores the user object in database on first login or update the existing
user in database on next logins

## Getting started

First, you need to install this module for OpenPaaS. To do it, create a symbol
link of this module in `modules` directory of OpenPaaS ESN then enable it in
local configuration:

```json
"modules": [
  "linagora.esn.account",
  ...
  "linagora.esn.lemonldap" // add this line
],
```

Once enabled, this module will be loaded with OpenPaaS and ready to work.
The next step is to configure LemonLDAP virtualhost to protect OpenPaaS.

In LemonLDAP _Manager_ page, go to `Virtual Hosts » <your virtualhost> » Access Rule`,
click on __New rule__, then fill:

```
Commments: Protect home page
Regular expressions: ^/$
Rules: accept
```

In the same page, change the `Default rule` to `unprotect` to allow other resources
of OpenPaaS to be accessible normaly from outside.

## User provision

This module provisions users automatically on their first login. It converts the
authenticated user information in trusted-headers to OpenPaaS user and creates
a user instance on the storage layer (MongoDB).

The converter needs a _mapping_ to know which field in headers is corresponding
to the user attribute in OpenPaaS. You can configure this _mapping_ in global
configuration.

The configuration is applied for the whole application so it must be platform-wide
configuration:

```json
"domain_id" : null,
"modules": [{
  "name": "core",
  "configurations": [...]
}, {
  "name": "linagora.esn.lemonldap",
  "configurations": [{
    "name": "mapping",
    "value": {
      "ll-auth-user": "auth-user", // required, mapping for unique username (usually email)
      "ll-auth-domain": "auth-domain",  // required, mapping for user domain
      "lastname": "auth-name",
      "main_phone": "auth-phone",
      ...
    }
  }, {
    ...
  }]
}]
```

## Logout

When the user logs out from OpenPaaS, he should be logged out from LemonLDAP and
vice versa, when the user logs out from LemonLDAP, he should be logged out from
OpenPaaS.

### Logout from OpenPaaS then LemonLDAP

To achieve this behaviour, OpenPaaS redirects the user to a logout endpoint of LemonLDAP
after his logout from OpenPaaS, hence the user is fully logged out from both services.

You can configure the logout endpoint in platform-wide configuration, it looks like:

```json
"domain_id" : null,
"modules": [{
  "name": "core",
  "configurations": [...]
}, {
  "name": "linagora.esn.lemonldap",
  "configurations": [{
    "name": "logoutUrl",
    "value": "http://auth.yoursite.com/?logout=1"
  }, {
    ...
  }]
}]
```

That logout endpoint is something like `http://auth.yoursite.com/?logout=1` depending
on your LemonLDAP setup.

## Logout from LemonLDAP then OpenPaaS

Once the user logs our from LemonLDAP, it then forwards the logout to other applications
to close their sessions. LemonLDAP has a logout forward mechanism, that will add
a step in logout process, to send logout requests (indeed, GET requests
on application logout URL) inside hidden iframes.

In LemonLDAP _Manager_ page, go to `General parameters » Advanced parameters » Logout forward` and
click on __Add a key__, then fill:

```
Key: application name, e.g. OpenPaaS
Value: OpenPaaS logout URL, e.g. http://openpaas.yoursite.com/logout
```

Note that the request on logout URL will be sent after user is disconnected,
so you should `unprotect` this URL if it is protected by a LemonLDAP Handler.
Forturnately, this is done above by setting the `Default rule` to `unprotect`.
