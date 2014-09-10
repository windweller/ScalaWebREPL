/*
  This modules adds code mirror code rendering to items on the page that
  contain code. To enable it on your elements add the classname:
  .deck-codemirror to your container and the classname 'codemirror-item'
  to any block that you wish to codemirrorify.
*/
(function($, deck, undefined) {

  var $d = $(document);
  
  /*
  Extends defaults/options.
  
  options.classes.codemirror
    This class is added to the deck container when there is code in the 
    slide that should be 
    
  options.selectors.codemirror-item
    This class should be added to the element containing code that should
    be highlighted.
  */
  $.extend(true, $[deck].defaults, {
    classes: {
      codemirror: 'deck-codemirror',
      codemirrorresult: 'deck-codemirror-result'
    },
    
    selectors: {
      codemirroritem: '.code',
    },

    data : {
      codemirrorified: 'codemirrorified'
    },
    codemirror : {
      lineNumbers : true,
      theme : "default",
      mode : "javascript",
      theme : "default",
      indentUnit : 1,
      indentWithTabs : false,
      // extraKeys: {"Ctrl-Space": "autocomplete"}, // TODO: upgrade to code mirror 3 and implement scala completion
      runnable : true
    }
  });

  // flag to indicate that we are currently in the editor. Required to stop keypress
  // propagation to all other extensions.
  var inEditor = false;

  // ------------ globals

  var message = function (msg) {
    console.log(msg);
  }

  // ------------ send / receive

  var connect = function (send, receivedReply) {
      try {
          // "ws://mindandlanguagelab.com:6696/ws/script"
          var socket = new WebSocket("ws://localhost:6696/ws/script");
          // message('Socket Status: '+socket.readyState);
          // $('#status').removeClass('off zero one two').addClass('zero')
          socket.onopen = function() {
             message('Socket Status: '+socket.readyState+' (open)');
             send(socket)
             // $('#status').removeClass('off zero one two').addClass('one')
          }
          socket.onmessage = function(msg) {
//                 receivedReply(msg.data+'\n\r') // not sure that's the right thing to do...
             receivedReply(msg.data) // not sure that's the right thing to do...
          }
          socket.onclose = function() {
            message('Socket Status: '+socket.readyState+' (Closed)');
            // $('#status').removeClass('off zero one two').addClass('two')
          }
      } catch(ex) {
         message('Error: '+ex)
      }
  }

  // a helper private function that can be used to "codemirror" a slide if that slide
  // has any elements with the proper classname.
  var codemirrorify = function(slide) {
    var $container = $[deck]('getContainer'),
        opts = $[deck]('getOptions'),
        codeblocks = $(slide).find(opts.selectors.codemirroritem),
        hiddenScripts  = [],
        cleanupScripts = [];

    // Seek out and cache all hidden scripts
    $("script[type=codemirror]").each(function() {
      hiddenScripts.push({
        selector: $(this).data("selector"),
        src: this.innerHTML
      });
    });
    
    // Seek out and cache all cleanup scripts
    $("script[type=\"codemirror/cleanup\"]").each(function() {
      cleanupScripts.push({
        selector: $(this).data("selector"),
        src: this.innerHTML
      });
    });

    // go through all code blocks
    $.each(codeblocks, function(i, codeblock) {

      // if codeblock hasn't been codemirrorified yet
      if (!$.data(codeblock, opts.data.codemirrorified)) {

        // initialize defaults.
        var codeblock = $(codeblock),
            editor    = null,
            options   = $.extend(opts.codemirror,
              {
                mode : !!codeblock.attr('mode') ? codeblock.attr('mode') : opts.codemirror.mode,
                theme : !!codeblock.attr('theme') ? codeblock.attr('theme') : opts.codemirror.theme,
                onFocus : function(e) {
                  inEditor = true;
                },
                onBlur : function(e) {
                  inEditor = false;
                }
              }
            );

        // if this is a textarea just use the codemirror shorthand.
        if (codeblock.get(0).nodeName.toUpperCase() === "TEXTAREA") {
          editor = CodeMirror.fromTextArea(codeblock[0], options);
          // initializeCompletion(CodeMirror);
        } else {
          // else codemirror the element's content and attach to element parent. 
          var parent  = codeblock.parent();
          codeblock.hide();
          editor      = CodeMirror(parent[0], 
            $.extend(options, {
              value : codeblock.html()
            })
          );
        }

        // mark that this code block has been codemirrored.
        $.data(codeblock[0], opts.data.codemirrorified, 'true');

        // attach a listener to this event to make sure that all other keybindings
        // don't trigger on keypress.
        $(editor.getWrapperElement()).keydown(function(e) {
          e.stopPropagation();
        });

        if (opts.codemirror.runnable || codeblock.attr("runnable")) {
          // make the code runnable
          var wrapper = editor.getWrapperElement(),
              button  = $('<div>', {
                "class" : "button",
                text : "Run"
              }).prependTo(wrapper),
              clearButton  = $('<div>', {
                "class" : "button clear",
                text : "Clear"
              }).prependTo(wrapper),
              output = $('<div>', {
                "class" : opts.classes.codemirrorresult
              }).appendTo($(wrapper).parent());

          clearButton.click(function(editor, output){
            return function(event) {
              output.html('');
            };
          }(editor, output));

          button.click(function(editor, output){
            return function(event) {
              try {
                connect(
                  function (socket) {
                    socket.send(editor.getValue());
                  },
                  function (msg) {
                    output.html("<pre>"+ msg.replace(/\n/g, '<br>')+ "</pre>")
                  });
              } catch (exception) {
                message(exception);
              }
            }
          }(editor, output));
        }
      }
    });
  };

  $d.bind('deck.init', function() {
    //codemirrorify all the decks so that scale is correctly computed
    var slides = $[deck]('getSlides');
    $(slides).each(function(i){
        codemirrorify($.deck('getSlide', i));
    });
  });
})(jQuery, 'deck', this);



