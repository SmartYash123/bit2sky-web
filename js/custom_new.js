$(document).ready(function() {
    $("#bannerSlider").owlCarousel({
        items: 1,
        loop: false,
        // autoplay: true,
        margin: 20,
        nav: false,
        dots: false,
        autoplayTimeout: 3500,
        autoplayHoverPause: false,
        smartSpeed: 2000,
        mouseDrag: false,
        touchDrag: false,
    }); 
})