window.BusinessBrowser = window.BusinessBrowser || {};

BusinessBrowser.Business = Backbone.Model.extend();
BusinessBrowser.Businesses = Backbone.Collection.extend({
	model: BusinessBrowser.Business,
	url: 'data/businesses.js'
});

BusinessBrowser.Item = Backbone.Model.extend();
BusinessBrowser.Items = Backbone.Collection.extend({
	model: BusinessBrowser.Item,
	url: 'data/items.js'
});

BusinessBrowser.current = {
	business: new BusinessBrowser.Business(),
	items: new BusinessBrowser.Items()
};

BusinessBrowser.init = function(){	
	this.picker = this.picker || {};
	this.picker.generations = [];	
	this.render();
};

BusinessBrowser.render = function(){
	this.picker.$el = $('#business-browser');
	this.picker.height = parseInt(UI.container.height/3); // default height of business picker (1/3)
	
	this.focusPane = this.focusPane || {};
	this.focusPane.$el = $('#business-focus-pane');
	
	this.focusPane.vPadding = this.focusPane.$el.css('paddingTop') + this.focusPane.$el.css('paddingBottom');
	this.picker.$el.css({'height' : BusinessBrowser.picker.height + 'px'});
	this.focusPane.$el.css({'top' : BusinessBrowser.picker.height + 'px'});	

	this.resize = function(e) {
		var y = (e.pageY - UI.container.offset.top) - e.data.toolBarClickOffset;
		if(y > UI.container.offset.top && UI.container.height > UI.container.offset.top){
			BusinessBrowser.picker.height = y;
			BusinessBrowser.picker.$el.css({'height' : BusinessBrowser.picker.height + 'px'});
			BusinessBrowser.focusPane.$el.css({
				'top' : BusinessBrowser.picker.height + 'px',
				'height' : UI.container.height - BusinessBrowser.picker.height - BusinessBrowser.focusPane.vPadding + 'px'
				});
		}
	};

	$(document.documentElement).mousedown(function(e) {
		if(e.target.id == 'business-focus-pane-toolbar' || e.target.id == 'business-focus-pane-title') {
			e.preventDefault();
			$(document.documentElement).bind('mousemove', {toolBarClickOffset : (e.pageY - (BusinessBrowser.picker.height + UI.container.offset.top))},  BusinessBrowser.resize);
		}
	}).mouseup(function(){
		$(document.documentElement).unbind('mousemove', BusinessBrowser.resize);
	});	
	
	$(window).resize(function() {
		UI.setDimensions();
		BusinessBrowser.focusPane.$el.css({'height' : UI.container.height - BusinessBrowser.picker.height - BusinessBrowser.focusPane.vPadding + 'px'});
	});
	
	this.load();
};

BusinessBrowser.load = function(){	
	this.picker.generations.push(new BusinessBrowser.Businesses());
	var column = new BusinessBrowser.Views.column({collection: _.last(this.picker.generations)});
	$('#business-browser-items').append(column.render().el);
	this.focusPane.view = new BusinessBrowser.Views.focusPane();
	_.last(this.picker.generations).fetch();	
};



BusinessBrowser.Views = {};

BusinessBrowser.Views.business = Backbone.View.extend({
	tagName: 'li',
	className: 'vcard',
	
	events: {
	    "click": "select"
	},
	
	initialize: function(){
		_.bindAll(this, 'render');
		this.model.bind('change', this.render);
		this.template = _.template($('#bizbrowser-business-list-template').html());
	},
	render: function(){
		var renderedContent = this.template(this.model.toJSON());				
		$(this.el).html(renderedContent).addClass(this.model.attributes.child_count != '0' ? 'children' : '').attr({'data-id': this.model.attributes.id});
		return this;
	},
	select: function(){
		var thisGeneration = _.indexOf(BusinessBrowser.picker.generations, this.model.collection);
		_.invoke(BusinessBrowser.picker.generations.splice(thisGeneration + 1, BusinessBrowser.picker.generations.length-thisGeneration),'trigger', 'kill');
		
		if(this.model.get('child_count') > 0){
			BusinessBrowser.picker.generations.push(new BusinessBrowser.Businesses());
			var column = new BusinessBrowser.Views.column({collection: _.last(BusinessBrowser.picker.generations)});
			$('#business-browser-items').append(column.render().el);
			_.last(BusinessBrowser.picker.generations).fetch();
		}
		
		$(this.el).removeClass('parent').addClass('selected').siblings('.selected').removeClass('selected');
		$(this.el).parents('.business-browser-column').prevAll().find('.selected').addClass('parent');
		
		Hub.router.navigate("businesses/" + this.model.get('id'), true);
		BusinessBrowser.current.business.set(this.model.clone());
		return this;
	}
});		

BusinessBrowser.Views.column = Backbone.View.extend({
	tagName: 'div',
	className: "business-browser-column",

	initialize: function(){
		_.bindAll(this, 'render', 'kill');
		this.template = _.template($('#bizbrowser-column-template').html());
		this.collection.bind('reset', this.render);
		this.collection.bind('kill', this.kill);
	},
	render: function(){
		$(this.el).html(this.template({}));
		$list = this.$('ul').hide();
		this.collection.each(function(business){
			var view = new BusinessBrowser.Views.business({
				model: business
			})
			$list.append(view.render().el);
		});		
		$list.show('drop', {easing: UI.settings.animation.easing}, UI.settings.animation.speed);
		return this;
	},	
	kill: function(){
		$(this.el).remove();
		return this;
	}
});

BusinessBrowser.Views.focusPane = Backbone.View.extend({	
	el: '#business-focus-pane',
	model: BusinessBrowser.current.business,
	initialize: function(){
		_.bindAll(this, 'render');
		this.model.bind('change', this.render);
		this.template = _.template($('#business-focus-pane-template').html());
		BusinessBrowser.itemsView = new BusinessBrowser.Views.focusPaneItems();	
	},
	
	render: function(){
		log('rendering focus pane')
		var renderedContent = this.template(this.model.toJSON());				
		$(this.el).html(renderedContent);
		_.invoke([UI.widgets.Accordians],'init', this.el); // set up accordion for this business
		
		BusinessBrowser.current.items.fetch();
		return this;
	}
})

BusinessBrowser.Views.focusPaneItems = Backbone.View.extend({	
	collection: BusinessBrowser.current.items,
	
	initialize: function(){
		_.bindAll(this, 'render');
		this.collection.bind('reset', this.render);
		this.template = _.template($('#business-focus-pane-items-template').html());
	},
	
	render: function(){
		log('rendering items')
		this.el = $('#business-focus-pane-focus');
		var renderedContent = this.template(this.collection.toJSON());				
		this.el.html(renderedContent);
		this.$("table").colResizable({
			liveDrag:true,
			draggingClass:"dragging"
		});
		return this;
	}
})