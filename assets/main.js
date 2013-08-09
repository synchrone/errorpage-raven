function Error500(message){
    this.name = 'Error500';
    this.message = message || this.name;
}
Error500.prototype = new Error();
function Error502(message){
    this.name = 'Error502';
    this.message = message || this.name;
}
Error502.prototype = new Error();
function Error504(message){
    this.name = 'Error504';
    this.message = message || this.name;
}
Error504.prototype = new Error();
function ErrorUNKNOWN(message){
    this.name = 'ErrorUNKNOWN';
    this.message = message || this.name;
}
ErrorUNKNOWN.prototype = new Error();

Raven.config(window.ravenApi).install();

$(document).ready(function(){
    var email_field = $('#contact_details').find('.email');
    email_field[0].innerHTML = window.emailAddress;
    email_field
        .attr('subject',window.emailSubject+window.location)
        .click(function(){
        var link = 'mailto:'+this.innerHTML;
        var subject = $(this).attr('subject');
        subject = subject ==undefined ? '' : '?subject='+subject;
        window.open(link+subject);
        return false;
    });
    $('.email-alias').click(function(){email_field.click();});

    function getNginxData(){
        //now this is intended to be replaced by nginx sub module
        var nginxData = __NGINXDATA__;
        if(nginxData != '__NGINX'+'DATA__'){
            return nginxData;
        }
        return {"code": 'UNKNOWN', "city":"unknown"};
    }
    function getCookies() {
        var cookies = document.cookie.split( ';' );
        var list = {} ;
        for ( i = 0; i < cookies.length; i++ ) {
            var cv = cookies[i].split( '=' );
            var name = cv[0].replace(/\s+/g, "").replace(/\s+$/g,"") ;
            list[name] =  cv[1] ;
        }
       return (list) ;
    }

    if(typeof window.ravenApi == 'undefined' || window.ravenApi == ''){ return; }

    $.ajax({
        url:window.errorpageRoot+'/geoip-json',
        dataType: 'jsonp',
        success: function(result)
        {
            var ex = new window['Error'+getHttpCode()]();

            var http = {
                cookies: getCookies(),
                env: {
                    'REMOTE_ADDR': result.host,
                    'HTTP Status': getNginxData().code,
                    'CITY': getNginxData().city
                },
                url: window.location.href,
                headers: {'User-Agent': navigator.userAgent}
            };
            if (window.document.referrer) {
                http.headers.Referer = window.document.referrer;
            }

            Raven.captureException(ex, {
                'sentry.interfaces.Http': http
            });
        }
    });
});
