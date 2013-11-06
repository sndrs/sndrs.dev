window.UI = window.UI || {};

UI.dims = UI.dims || {};

UI.init = function() {
	UI.container = UI.container || {};
	UI.container.$el = $('#container');
	UI.setDimensions();	
	UI.widgets.Accordians.init();
	UI.widgets.Panels.init();
};

UI.setDimensions = function() {	
	// saves querying dimensions from DOM
	UI.container.offset = UI.container.$el.offset();	
	UI.container.height = UI.container.$el.height();
};

UI.settings = {};
UI.settings.animation = {	
	speed: 250,
	easing: 'easeInOutCubic'
};

UI.widgets = UI.widgets || {};
UI.widgets.Panels = {
	init: function(){
		$(document.documentElement).click(function(e){
			var el = e.target;
			// close open panel if click came from elsewhere
			var $openPanel = $('.dropdown-panel.visible');			
			if($openPanel.length > 0){
				e.preventDefault();
				_.each($openPanel, function(panel){
					if(!$.contains(panel, el)){
						$(panel).removeClass('visible');
					}
				})				
			}
			// open panel if click source has data-panel-id attr
			var $el = $(el);
			if($el.attr('data-panel-id')){
				$("#" + $el.attr('data-panel-id')).toggleClass('visible');
			}
		})
	}
};
UI.widgets.Accordians = {
	init: function(el){
		$('.accordion', el).each(function(){
			var $accordion = $(this);
			var $options = $accordion.children();
			
			$accordion.data({			
				'optionHeight': $('a', this).outerHeight()
			});
			
			$options.each(function(i){
				$(this).css({
					'position': 'absolute',
					'left': 0,
					'right': 0,
					'top': i * $accordion.data('optionHeight') + 'px',
					'bottom': ($options.length - 1 - i) * $accordion.data('optionHeight') + 'px',
					'height': 'auto'
				}).children().not('a').wrapAll('<div />').css({
					'position': 'absolute',
					'top': 0,
					'left': 0,
					'right': 0,
					'bottom': 0
				}).parent().css({
					'position': 'absolute',
					'top': $accordion.data('optionHeight') + 'px',
					'right': 0,
					'left': 0,
					'bottom': 0,
					'overflow': 'auto'
				});				
			})			
			
			$options.bind('select', function(e){
				var $selected = $(this);
				$options.siblings('.selected').removeClass('selected');
				$selected.addClass('selected');
				
				// move selected and before to top
				$accordion.find(this).prevAll().andSelf().each(function(i){
					var $this = $(this);
					if($this.css('top') == 'auto'){	
						$this.css({'top': $this.position().top + 'px'});					
						$this.animate({
							top: (i * $accordion.data('optionHeight')) + 'px'
						}, UI.settings.animation.speed, UI.settings.animation.easing);		
					}			
				})						
				
				// move rest to bottom
				var accordionHeight = $accordion.outerHeight();
				$accordion.find(this).nextAll().reverse().each(function(i){	
					var $this = $(this);	
					if($this.css('top') != 'auto'){	
						$this.animate({
							top: accordionHeight - (i * $accordion.data('optionHeight')) - $accordion.data('optionHeight') + 'px'
						}, UI.settings.animation.speed, UI.settings.animation.easing, function(){
							$this.css({'top': 'auto'});
						});	
					}					
				})
				
			}).bind('click', function(e){	
				e.preventDefault();			
				$(e.target).closest(".accordion li").trigger('select');
			});
		
			$options.first().trigger('select');		
		});	
	}
}