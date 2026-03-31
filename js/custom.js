$("#inquiry-form").validate({
    rules: {
        name: {
            minlength: 2
        },
        email: {
            required: true,
        },
        captcha: {
            required: true,
        },
        terms_and_condition:{
            required: true,
        }

    },
    submitHandler: function (form) {
        form.submit()
    }
});

$("#quote-form").validate({
    rules: {
        name: {
            minlength: 2
        },
        quote_email: {
            required: true,
        },
    },
    submitHandler: function (form) {
        form.submit()
    }
});

$("#contact-form").validate({
    rules: {
        name: {
            minlength: 2
        },
        email: {
            required: true,
        },
        terms_and_condition:{
            required: true,
        }
    },
    submitHandler: function (form) {
        form.submit()
    }
});
$(".alert-success").delay(5e3).fadeOut("slow");
$(".alert-danger").delay(5e3).fadeOut("slow");
function isNumber(evt) {
    var iKeyCode = (evt.which) ? evt.which : evt.keyCode
    if (iKeyCode != 46 && iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57))
        return false;
    return true;
}
$("input[name='name']").keypress(function(e) {
    if (e.which === 32 && !this.value.length) {
        e.preventDefault();
    }
    var k;
    document.all ? k = e.keyCode : k = e.which;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32);
});
$("input[name='email']").keypress(function(e) {
    if (e.which === 32 && !this.value.length) {
        e.preventDefault();
    }
});
