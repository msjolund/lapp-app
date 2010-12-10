/* project component JS resource */
var project = {
    onDomReady: function() {
        $(".boards ul li").hover(function () { $(this).addClass("hover") }, function () { $(this).removeClass("hover") })
    }
};
