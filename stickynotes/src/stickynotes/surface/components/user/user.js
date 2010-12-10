/* user component JS resource */
var user =
{
    onDomReady: function ()
    {       
        // Add Orbit event listeners here
    },

    onFacebookLogin: function ()
    {
        if (document.getElementById("facebookConnectLoginRedirectUrl"))
           location.href = document.getElementById("facebookConnectLoginRedirectUrl").value;
    },

    facebookLogout: function ()
    {
        if (document.getElementById("facebookConnectApiKey").value)
        {
            if (Surface.readCookie(document.getElementById("facebookConnectApiKey").value))
            {
                FB.Connect.logoutAndRedirect(document.getElementById("facebookConnectLogoutUrl").value)
            }
            else
            {
                location.href = document.getElementById("facebookConnectLogoutUrl").value;
            }
        }
    }
    
    // Your user functionality here
}
