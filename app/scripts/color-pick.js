/*
 *  Project: 
 *  Description: 
 *  Author: 
 *  License: 
 */

// the semi-colon before function invocation is a safety net against concatenated 
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, undefined ) {

  var numbersString = ['one', 'two', 'three']

  //Generates a new single color, recibes name and value of the single color, also generates it's DOM object
  function Color(name, colorValue){
    this.el = null;
    this.$el = null;
    this.name = name;
    this.value = colorValue;
  }

  function ColorGroup(config){
    var _this = this;
    this.el = null;
    this.$el = null;
    this.config = config;
    this.rangeFirstColorValue = config.groupRange[0];
    this.rangeLastColorValue = config.groupRange[1];
   
    this.colors = [];
    this.name = this.config.groupName;
  }

  ColorGroup.prototype = {

    generateColors: function(){
      var _this = this;
      var i = 0,
          colors = this.config.colors,
          len = colors.length,
          colorName = "",
          colorValue = "";

      for(i; i < len; i++){
        colorName = colors[i].colorName;
        colorValue   = colors[i].colorHex;
        this.colors.push(new Color(colorName, colorValue));
      }

      this.generateColors = function(){
        return _this.colors;
      }

      return _this.colors;
    }

  };

  //Views  
  var Views = { };
  //esos son todos los html!!
  Views.Templates = {
    
    bullet:     "<li data-id='pick-<%= name %>'>"+
                  "<span class='color-bubble'>"+
                    "<span class='color-half' style= 'background-color: <%= rangeFirstColorValue %>'></span>"+
                    "<span class='color-half' style= 'background-color: <%= rangeLastColorValue %>'></span>"+
                  "</span>"+
                "</li>",
    
    simpleBullet:   "<li>"+
                      "<span class='color-bubble' style= 'background-color: <%=value %>'>"+
                      "</span>"+
                    "</li>",
    
    groupColors: "<ul id='pick-<%= name %>'></ul>",
    
    pallete: '<div class="color-container">' +
                '<a href="#" class="color-toggle">' +
                    '<span class="color-bubble color-sample"></span>' +
                    '<span class="color-arrow"></span>' +
                '</a>'+
                '<div class="color-options">'+
                  '<ul class="color-options-upper"> </ul>'+
                  '<div class="color-panel"> </div>' +
                    '<div class="color-options-down">'+
                        '<a href="#" class="color-back">back</a>'+
                        '<span>text</span>'+
                    '</div>'+
                '</div>'+
             '</div>'
  };
  
  Views.Color  = function(color){
    this.model = color; 
    this.$el; 
  };

  Views.Color.prototype.render = function(){
    //Memoize
    this.$el = $(_.template(Views.Templates.simpleBullet)(this.model));
    this.bindEvents();
    return this.$el;
  };

  Views.Color.prototype.bindEvents = function(){
    this.$el.on("click.filter", Callbacks.colorClick.bind(this));
    this.$el.on('mouseenter.filter', Callbacks.bulletMouseEnter.bind(this));
  };
  
  
  Views.ColorGroup = function(colorGroup){
   this.$colorsEl = null;
   this.$el = null;
   this.model = colorGroup;
  };
  
  Views.ColorGroup.prototype.render = function(){
    this.$el = $(_.template(Views.Templates.bullet)(this.model));
    
    //Create group colors list
    this.$colorsEl = $(_.template(Views.Templates.groupColors)(this.model));

    _.each(this.model.generateColors(), function(color, index, colors){
        var colorView = new Views.Color(color);
        this.$colorsEl.append(colorView.render());
        
      }, this);
    
    this.bindEvents();
    return this.$el;
  }

  Views.ColorGroup.prototype.bindEvents = function(){
    this.$el.on("click.filter", Callbacks.groupClick.bind(this));
    this.$el.on('mouseenter.filter', Callbacks.bulletMouseEnter.bind(this));
  };
  
  Views.Pallete = function(pallete){
    this.pallete = pallete;
    this.$el;
  };
  
  Views.Pallete.prototype.render = function(){

    this.$el = $(_.template(Views.Templates.pallete)({}));

    var $colorGroupUL = this.$el.find('ul.color-options-upper')
        $groupColorsList = this.$el.find('.color-panel');

    _.each(this.pallete, function(colorGroup, index, pallete){
      var colorGroupView = new Views.ColorGroup(colorGroup);
      colorGroupView.render();
      $colorGroupUL.append(colorGroupView.$el);
      $groupColorsList.append(colorGroupView.$colorsEl);
    }, this);
  
    this.bindEvents();
    return this.$el;
  };

  Views.Pallete.prototype.bindEvents = function(){
  };

  var Callbacks = {

    groupClick: function(e){
      this.$colorsEl.parent().children().hide();
      this.$colorsEl.show();
      var el = e.target,
          parent = $(el).closest('.dropdown-colors');
      parent.trigger('paneltoggle.filter', this);
    },

    bulletMouseEnter: function(e){
      var el = e.target,
          name = this.model.name,
          parent = $(el).closest('.dropdown-colors');
      parent.trigger('namechange.filter', {
        name: name,
        model: this.model
      });
    },

    colorClick: function(e){
      var el = e.target,
          name = this.model.name,
          parent = $(el).closest('.dropdown-colors');
      parent.trigger('selectedcolor.filter', {
        name: name,
        model: this.model
      });
    }
  };



  // undefined is used here as the undefined global variable in ECMAScript 3 is
  // mutable (ie. it can be changed by someone else). undefined isn't really being
  // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
  // can no longer be modified.

  // window and document are passed through as local variables rather than globals
  // as this (slightly) quickens the resolution process and can be more efficiently
  // minified (especially when both are regularly referenced in your plugin).

  // Create the defaults once
  var pluginName = 'colorFilter',
      document = window.document,
      defaults = {
        colorGroups: [
        {
          groupName: "Reds",
          groupRange: ["#FF1400","#DF1100"],
          colors: [
            {
              colorName: "red",
              colorHex: "#FF1400"
            },
            {
              colorName: "red dark",
              colorHex: "#DF1100"
            }
          ]
        },

        {
          groupName: "Oranges",
          groupRange: ["#FF8000","#DF7000"],
          colors: [{
            colorName: "Orange",
            colorHex: "#FF8000"
          },
          {
            colorName: "Orange Light",
            colorHex: "#DF7000"
          }]
        },

        {
          groupName: "Yellows",
          groupRange: ["#FFCB00","#DFB100"],
          colors: [{
            colorName: "Yellow",
            colorHex: "#FFCB00"
          }]
        },

        {
          groupName: "greens",
          groupRange: ["#9DD00F","#89B60D"],
          colors: [{
            colorName: "blue",
            colorHex: "#333333"
          }]
        },

        {
          groupName: "Blues",
          groupRange: ["#2DA7D7","#2792BC"],
          colors: [{
            colorName: "blue",
            colorHex: "#333333"
          }]
        },

        {
          groupName: "Pinks",
          groupRange: ["#FF3BA7","#DF3392"],
          colors: [{
            colorName: "blue",
            colorHex: "#333333"
          }]
        },

        {
          groupName: "Purples",
          groupRange: ["#9E48AB","#8A3F95"],
          colors: [{
            colorName: "blue",
            colorHex: "#333333"
          }]
        },
        {
          groupName: "Blacks",
          groupRange: ["#000000","#000000"],
          colors: [{
            colorName: "blue",
            colorHex: "#333333"
          }]
        },
        ],
        className: 'dropdown inline-block dropdown-colors',
        bulletClassName: 'color'
      };

          
      
  // The actual plugin constructor
  function Plugin( element, options ) {
    this.el = element;
    this.$el = $(element);
    this.selected = "";
    this.isColorPanelOpen = false;

    // jQuery has an extend method which merges the contents of two or 
    // more objects, storing the result in the first object. The first object
    // is generally empty as we don't want to alter the default options for
    // future instances of the plugin
    this.options = $.extend(true, {}, defaults, options);

    this.el.className = this.options.className;

    this.data = this.options.colorGroups;

    this._defaults = defaults;
    this._name = pluginName;
    this.pallete = [];

    this.init();
  }
  
  var buildPallete = function(){
    var i = 0,
        len = this.data.length,
        colorGroup;
    for(i; i < len; i++){
      colorGroup = new ColorGroup(this.data[i]);
      this.pallete.push(colorGroup);
    }
    return this.pallete;
  };


  Plugin.prototype.init = function () {
    // Place initialization logic here
    // You already have access to the DOM element and the options via the instance, 
    // e.g., this.element and this.options
    _this = this;
    buildPallete.apply(this);
    var pallete = new Views.Pallete(this.pallete).render()
    this.$el.append(pallete)
    console.log(this);


    this.$el.on('namechange.filter', function(e, data){
      _this.$el.find(".color-options-down span").text(data.name)
    });

    this.$el.on('selectedcolor.filter', function(e, data){
      _this.selected = data.model.value;
      _this.$el.find('.color-sample').css('background-color', _this.selected)
    });

    this.$el.on('paneltoggle.filter', this.togglePanels.bind(this));

    this.$el.on('click', '.color-back', this.togglePanels.bind(this));

  };

  Plugin.prototype.togglePanels = function(e){
      var panel = $(_this.$el).find(".color-panel"),
          upperPanel = $(_this.$el).find(".color-options-upper")
          buttonPanel = $('.color-back');

      if(!this.isColorPanelOpen){
        panel.show(100);
        upperPanel.hide(50);
        this.isColorPanelOpen = !this.isColorPanelOpen;
      }else{
        panel.hide(50);
        upperPanel.show(100);
        this.isColorPanelOpen = !this.isColorPanelOpen;
      }
      buttonPanel.toggle(this.isColorPanelOpen);
      e.preventDefault();
  }


  // A really lightweight plugin wrapper around the constructor, 
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
      }
    });
  }

$("#hola").colorFilter()
}(jQuery, window));