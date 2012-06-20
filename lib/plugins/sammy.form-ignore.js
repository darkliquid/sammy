(function($) {

	Sammy = Sammy || {};

	/*
	Plugin allows setting of a function that returns true/false to indicate
	whether or not a form should be processed by Sammy. Also block processing
	of forms with no action attribute set.
	
	Credits to Fabien Baligand for the original code
	*/
	Sammy.FormIgnore = function(app) {

		// Based on this [Monkey patch](http://groups.google.com/group/sammyjs/browse_thread/thread/1185bed98824df3f/28e901549b853796)

		app.defaultCheckFormSubmission = this._checkFormSubmission;
		app.ignoreFormIf = function(func) {
			if ($.isFunction(func)) {
				this.ignore_form_func = func;
			}
		};

		app._checkFormSubmission = function (form) {
			var $form;
			$form = $(form);
			if($form.attr('action') === undefined || this.ignore_form_func && this.ignore_form_func($form)) {
				return false;
			} else {
				return this.defaultCheckFormSubmission(form);
			}
		};

	};

})(jQuery);