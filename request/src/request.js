window.app = (function (){

    var app = {
        data: {
		
        },
        init: {
            form: function(){	
                //init the number spinner for the form             
				app.ui.capture();
				app.init.startSpinner();
			},
			startSpinner: function(){
				$('#spinner button').on('click', function(){
					let input = $(this).closest('#spinner').find('input[name=qty]');

					if($(this).data('action') === 'increment') {
						if(input.attr('max') === undefined || parseInt(input.val()) < parseInt(input.attr('max'))) {
						input.val(parseInt(input.val(), 10) + 1);
						}
					} else if($(this).data('action') === 'decrement') {
						if(input.attr('min') === undefined || parseInt(input.val()) > parseInt(input.attr('min'))) {
						input.val(parseInt(input.val(), 10) - 1);
						}
					}	
				});		
			}
        },
        ui: {
            capture: function(){

				var bind = function(title, desc, clientid, priority, tdate, parea){
					this.title = ko.observable(title);
					this.desc = ko.observable(desc);
					this.clientid = ko.observable(clientid);
					this.priority = ko.observable(priority);
					this.tdate = ko.observable(tdate);
					this.parea = ko.observable(parea);

					console.log(title, desc, clientid, priority, tdate, parea);
				}
				var theprocess = function(){
					var theData = new bind("", "", "", "", "", "");
					var payload = [];
					payload.push(theData);

					this.submit = function(){
						var data = $.map(payload());
						alert('Sending: ' + JSON.stringify(data));
					}
				}	
				ko.applyBindings(new theprocess());			
            }
        },
        util: {
        }
    };

    return app;
}());
$(window).load(function(){ app.init.form(); });
