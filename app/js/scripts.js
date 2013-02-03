AttendrApi = {
    api_url : 'http://caelondia.student.rit.edu/',
    
    login : function(email, firstname, lastname, password)
    {
        this.request('user/create', 'POST', {
            'name' : {
                'first' : firstname,
                'last' : lastname
            },
            'email' : email
        }, function(data) {
            AttendrApi.save('user', data);
            window.location = 'dashboard.html';
        }, function(msg) {
            alert('Error has occurred.');
        });
    },

    getEvents : function(callback) {
        this.request('event/all', 'GET', {}, function(data) {
            AttendrApi.save('events', data);
            console.log(data);
            callback(data);
        }, function(msg) {
            alert('Error has occurred.');
        });
    },

    getEvent : function(eventid, callback) {
        var events = this.get('events');
        $.each(events, function(key, value) {
            if( value._id == eventid ) {
                callback(value);
            }
        });
    },

    getPosts : function(eventid, callback) {
        this.request('post/get', 'POST', {
            'user' : AttendrApi.get('user')._id,
            'event' : eventid
        }, function(msg) {
            callback(msg);
        });
    },

    request : function(endpoint, method, data, success, error) {
        success = success || function() {};
        error = error || function() {};
        data = (this.isEmpty(data)) ? '' : JSON.stringify(data);

        $.ajax({
            type: method,
            contentType: "application/json",
            data: data,
            url: this.api_url + endpoint
        }).done(function(msg) {
            success(msg);
        }).fail(function(xhr, msg) {
            error(msg);
        });
    },

    isEmpty : function(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    },

    save : function(name, value) {
        $.cookie(name, JSON.stringify(value));
    },

    get : function(name) {
        return $.parseJSON($.cookie(name));
    },

    loadView : function(dom, template_name, data) {
        var source   = $('#' + template_name).html();
        var template = Handlebars.compile(source);
        dom.html(template(data));
    },

    getUrlParam : function(name) {
        return $(document).getUrlParam(name);
    },

    initScheduleAnEvent : function() {
        $('#start').datepicker({
            defaultDate: "today",
            changeMonth: true,
            numberOfMonths: 2,
            onClose: function( selectedDate ) {
                $('#end').datepicker( "option", "minDate", selectedDate );
            }
        });

        $('#end').datepicker({
            defaultDate: "today",
            changeMonth: true,
            numberOfMonths: 2,
            onClose: function( selectedDate ) {
                $('#start').datepicker( "option", "maxDate", selectedDate );
            }
        });

        var hours = [];
        var minutes = [];
        var xstr = '';
        for( var x = 1; x < 13; x++ ) {
            if( x < 10 ) {
                xstr = '0' + x;
            } else {
                xstr = '' + x;
            }
            hours.push({ name : xstr, value : xstr });
        }

        var ystr = '';
        for( var y = 0; y < 60; y++ ) {
            if( y < 10 ) {
                ystr = '0' + y;
            } else {
                ystr = '' + y;
            }
            minutes.push({ name : ystr, value : ystr });
        }

        this.loadView($('#start_time_h'), 'select-template', {
            options : hours
        });

        this.loadView($('#end_time_h'), 'select-template', {
            options : hours
        });

        this.loadView($('#start_time_m'), 'select-template', {
            options : minutes
        });

        this.loadView($('#end_time_m'), 'select-template', {
            options : minutes
        });

        $('#start_time_h').val('05');
        $('#start_time_m').val('30');
        $('#start_time_a').val('PM');

        $('#end_time_h').val('06');
        $('#end_time_m').val('30');
        $('#end_time_a').val('PM');


        var start = $('#start').val();
        var start_time_h = $('#start_time_h').val();
        var start_time_m = $('#start_time_m').val();
        var start_time_a = $('#start_time_a').val();
    },

    parseDate : function(str) {
        // we assume str is a UTC date ending in 'Z'

        var parts = str.split('T'),
        dateParts = parts[0].split('-'),
        timeParts = parts[1].split('Z'),
        timeSubParts = timeParts[0].split(':'),
        timeSecParts = timeSubParts[2].split('.'),
        timeHours = Number(timeSubParts[0]),
        _date = new Date();

        _date.setUTCFullYear(Number(dateParts[0]));
        _date.setUTCMonth(Number(dateParts[1])-1);
        _date.setUTCDate(Number(dateParts[2]));
        _date.setUTCHours(Number(timeHours));
        _date.setUTCMinutes(Number(timeSubParts[1]));
        _date.setUTCSeconds(Number(timeSecParts[0]));
        if (timeSecParts[1]) _date.setUTCMilliseconds(Number(timeSecParts[1]));

        // by using setUTC methods the date has already been converted to local time(?)
        return _date;
    }
};