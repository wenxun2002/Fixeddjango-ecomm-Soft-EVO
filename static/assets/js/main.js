/*  ---------------------------------------------------
    Template Name: Ogani
    Description:  Ogani eCommerce  HTML Template
    Author: Colorlib
    Author URI: https://colorlib.com
    Version: 1.0
    Created: Colorlib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Gallery filter
        --------------------*/
        $('.featured__controls li').on('click', function () {
            $('.featured__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.featured__filter').length > 0) {
            var containerEl = document.querySelector('.featured__filter');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Humberger Menu
    $(".humberger__open").on('click', function () {
        $(".humberger__menu__wrapper").addClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").addClass("active");
        $("body").addClass("over_hid");
    });

    $(".humberger__menu__overlay").on('click', function () {
        $(".humberger__menu__wrapper").removeClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").removeClass("active");
        $("body").removeClass("over_hid");
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*-----------------------
        Categories Slider
    ------------------------*/
    $(".categories__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 4,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {

            0: {
                items: 1,
            },

            480: {
                items: 2,
            },

            768: {
                items: 3,
            },

            992: {
                items: 4,
            }
        }
    });


    $('.hero__categories__all').on('click', function(){
        $('.hero__categories ul').slideToggle(400);
    });

    /*--------------------------
        Latest Product Slider
    ----------------------------*/
    $(".latest-product__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*-----------------------------
        Product Discount Slider
    -------------------------------*/
    $(".product__discount__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 3,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {

            320: {
                items: 1,
            },

            480: {
                items: 2,
            },

            768: {
                items: 2,
            },

            992: {
                items: 3,
            }
        }
    });

    /*---------------------------------
        Product Details Pic Slider
    ----------------------------------*/
    $(".product__details__pic__slider").owlCarousel({
        loop: true,
        margin: 20,
        items: 4,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*-----------------------
		Price Range Slider
	------------------------ */
    var rangeSlider = $(".price-range"),
        minamount = $("#minamount"),
        maxamount = $("#maxamount"),
        minPrice = rangeSlider.data('min'),
        maxPrice = rangeSlider.data('max');
    rangeSlider.slider({
        range: true,
        min: minPrice,
        max: maxPrice,
        values: [minPrice, maxPrice],
        slide: function (event, ui) {
            minamount.val('$' + ui.values[0]);
            maxamount.val('$' + ui.values[1]);
        }
    });
    minamount.val('$' + rangeSlider.slider("values", 0));
    maxamount.val('$' + rangeSlider.slider("values", 1));

    /*--------------------------
        Select
    ----------------------------*/
    $("select").niceSelect();

    /*------------------
		Single Product
	--------------------*/
    $('.product__details__pic__slider img').on('click', function () {

        var imgurl = $(this).data('imgbigurl');
        var bigImg = $('.product__details__pic__item--large').attr('src');
        if (imgurl != bigImg) {
            $('.product__details__pic__item--large').attr({
                src: imgurl
            });
        }
    });

    /*-------------------
		Quantity change
	--------------------- */
    var proQty = $('.pro-qty');
    proQty.each(function() {
        var $this = $(this);
        var inCart = $this.closest('#cart-list, .shoping-cart, .shoping__cart__table').length > 0;
        var inputVal = parseInt($this.find('input').val());
        
        var decIcon = '-';
        if (inCart && inputVal <= 1) {
            decIcon = '<i class="fa fa-trash"></i>';
        }
        var $decBtn = $('<span class="dec qtybtn">' + decIcon + '</span>');
        if (!inCart && inputVal <= 1) {
            $decBtn.css('visibility', 'hidden');
        }
        $this.prepend($decBtn);
        $this.append('<span class="inc qtybtn">+</span>');

        $this.find('input').on('keyup change', function() {
            var val = parseInt($(this).val());
            if (!inCart) {
                if (val <= 1) {
                    $decBtn.css('visibility', 'hidden');
                } else {
                    $decBtn.css('visibility', 'visible');
                }
            }
        });
    });

    proQty.on('click', '.qtybtn', function () {
        var $button = $(this);
        var $input = $button.parent().find('input');
        var oldValue = parseInt($input.val());
        var maxStock = $input.data('max');
        var inCart = $button.closest('#cart-list, .shoping-cart, .shoping__cart__table').length > 0;

        if ($button.hasClass('inc')) {
            var newVal = oldValue + 1;
            if (maxStock !== undefined && maxStock !== '' && newVal > parseInt(maxStock)) {
                alert("You can't add more than the available stock (" + maxStock + ")!");
                newVal = parseInt(maxStock);
            }
            $input.val(newVal).trigger('change');
            if (inCart && newVal > 1) {
                $button.siblings('.dec').html('-').css('visibility', 'visible');
            } else if (!inCart && newVal > 1) {
                $button.siblings('.dec').css('visibility', 'visible');
            }
        } else {
            if (inCart && oldValue <= 1) {
                var $deleteBtn = $button.closest('tr').find('.delete-product');
                if ($deleteBtn.length) {
                    $deleteBtn.click();
                }
                return;
            }
            if (oldValue > 1) {
                var newVal = oldValue - 1;
                $input.val(newVal).trigger('change');
                if (inCart && newVal <= 1) {
                    $button.html('<i class="fa fa-trash"></i>').css('visibility', 'visible');
                } else if (!inCart && newVal <= 1) {
                    $button.css('visibility', 'hidden');
                }
            }
        }
    });

})(jQuery);