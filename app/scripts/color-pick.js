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
                        '<span class="color-text">Color</span>'+
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
    this.$el.on('mouseleave.filter', Callbacks.bulletMouseOut.bind(this));
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
    this.$el.on('mouseleave.filter', Callbacks.bulletMouseOut.bind(this));
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
          parent = $(el).closest('.picker-wrapper');
      parent.trigger('paneltoggle.filter', this);
    },

    bulletMouseEnter: function(e){
      var el = e.target,
          name = this.model.name,
          parent = $(el).closest('.picker-wrapper');
      parent.trigger('namechange.filter', {
        name: name,
        model: this.model
      });
    },

    bulletMouseOut: function(e){
      var el = e.target,
          name = this.model.name,
          parent = $(el).closest('.picker-wrapper');
      parent.trigger('namechange.filter', {
        name: "Color"
      });
    },

    colorClick: function(e){
      var el = e.target,
          name = this.model.name,
          parent = $(el).closest('.picker-wrapper');
      parent.trigger('selectedcolor.filter', {
        name: name,
        model: this.model
      });
    }
  };

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
            colorName: "Green",
            colorHex: "#9DD00F"
          },
          {
            colorName: "Ligth Green",
            colorHex: "#89B60D"
          }]
        },

        {
          groupName: "Blues",
          groupRange: ["#2DA7D7","#2792BC"],
          colors: [{
            colorName: "Blue",
            colorHex: "#2DA7D7"
          },
          {
            colorName: "Ligth Blue",
            colorHex: "#2792BC"
          }]
        },

        {
          groupName: "Pinks",
          groupRange: ["#FF3BA7","#DF3392"],
          colors: [{
            colorName: "Pink",
            colorHex: "#FF3BA7"
          },
          {
            colorName: "Ligth Pink",
            colorHex: "#DF3392"
          }]
        },

        {
          groupName: "Purples",
          groupRange: ["#9E48AB","#8A3F95"],
          colors: [{
            colorName: "Purple",
            colorHex: "#9E48AB"
          },
          {
            colorName: "Ligth Purple",
            colorHex: "#8A3F95"
          }]
        },
        {
          groupName: "Blacks",
          groupRange: ["#000000","#000000"],
          colors: [{
            colorName: "Black",
            colorHex: "#000000"
          }]
        }
        ],
        className: 'dropdown inline-block color-filter',
        bulletClassName: 'color'
      };

  function setSelected(color){
    var color = color.trim();
    this.selected = color;
    this.$el.trigger("changecolor.filter", color)
  }

  function buildPallete(){
    var i = 0,
        len = this.data.length,
        colorGroup;
    for(i; i < len; i++){
      colorGroup = new ColorGroup(this.data[i]);
      this.pallete.push(colorGroup);
    }
    return this.pallete;
  };

  function togglePanels(e){
      var panel = $(_this.$wrapper).find(".color-panel"),
          upperPanel = $(_this.$wrapper).find(".color-options-upper"),
          buttonPanel = $('.color-back');

      if(!this.isColorPanelOpen){
        panel.show(100);
        upperPanel.hide(100);
        this.isColorPanelOpen = !this.isColorPanelOpen;
      }else{
        panel.hide(100);
        upperPanel.show(100);
        this.isColorPanelOpen = !this.isColorPanelOpen;
      }
      buttonPanel.toggle(this.isColorPanelOpen);
      e.preventDefault();
  }

  function events(){
    this.$wrapper.on('namechange.filter', function(e, data){
      _this.$wrapper.find(".color-options-down span").text(data.name);
    });

    this.$wrapper.on('selectedcolor.filter', function(e, data){
      setSelected.call(_this, data.model.value);
    });

    this.$wrapper.on('paneltoggle.filter', togglePanels.bind(this));

    this.$wrapper.on('click.filter', '.color-back', togglePanels.bind(this));

    this.$wrapper.on('changecolor.filter', function(e, color){
      _this.$wrapper.find('.color-sample').css('background-color', color);
      _this.$el.val(color);
    });

    this.$wrapper.on('click.filter', '.cancel-selection', function(e){
      e.preventDefault();
      setSelected.call(_this, "");
    });
  }


  function Plugin( element, options ) {
    this.el = element;
    this.$el = $(element);
    this.selected = "";
    this.isColorPanelOpen = false;
    this.options = $.extend(true, {}, defaults, options);
    this.data = this.options.colorGroups;
    this._defaults = defaults;
    this._name = pluginName;
    this.pallete = [];

    this.init();
  }


  Plugin.prototype.init = function () {
    _this = this;
    this.$wrapper = this.$el.wrap('<div class="picker-wrapper">').parent();
    buildPallete.apply(this);
    var pallete = new Views.Pallete(this.pallete).render(),
        upperPanel,
        cancelSelection = $('<li><a href="#" class="cancel-selection">hola</a></li>');
    this.$wrapper.addClass(this.options.className);
    this.$wrapper.append(pallete);
    upperPanel = $(_this.$wrapper).find(".color-options-upper");
    upperPanel.append(cancelSelection);
    events.call(this);

  };


  var methods = {};
  Plugin.prototype.select = function(option){
    console.log(option)
    if(!option && option !== ""){
      return this.selected;
    }else{
        setSelected.call(this, option);
    }
  }


  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    var method = Array.prototype.slice.call(arguments, 0, 1),
        args = Array.prototype.slice.call(arguments, 1),
        data = $(this).data('plugin_' + pluginName);
    if(data && data[method]){
      return data[method].apply(data, args);
    }

    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
      }
    });
  }

$("#hola").colorFilter()
}(jQuery, window));