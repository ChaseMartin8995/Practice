window.app = (function (){

    var app = {
        data: {
		
        },
        init: {
            form: function(){	
                //bind form elements with Knockout            
				app.ui.bind();
				//init the number spinner for the form 
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
            bind: function(){
				var viewModel = function() {
					var self = this;
					// bind elements
					self.title = ko.observable('');
					self.desc = ko.observable(''),
					self.clientid = ko.observable(''),
					self.priority = ko.observable('1'),
					self.tdate = ko.observable(''),
					self.parea = ko.observable(''),
					// bind submit functionality
					self.submitData = function(){
						var data = {};
						//capture data
						data.title = self.title();
						data.desc = self.desc();
						data.clientid = self.clientid();
						data.priority = self.priority();
						data.tdate = self.tdate();
						data.parea = self.parea();

						// prepare data for submission
						data = JSON.stringify(data);
					
						console.log(data);
						// submit data
						$.ajax({
							url: '/mainRequest',
							data: data,
							dataType: 'JSON',
							type: 'POST',
							success: function() {
								alert('Submitted!');
							},
							error: function(error) {
								console.log(error.error);
							}
						});

					}
				};

				ko.applyBindings(viewModel);			
            }
        },
        util: {
        }
    };

    return app;
}());

document.addEventListener('DOMContentLoaded', function() {
	app.init.form();
 });