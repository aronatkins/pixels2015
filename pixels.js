function pixels(id, data) {
  var space = 5;
  var width = Math.max.apply(
    null,
    data.map(function(s) {
      return s.length;
    })
  );
  var remaining = data.length * width;
  var coords = [];

  function coord_to_id(x, y) {
    return "cell_" + x + "_" + y;
  }

  function pad_lines(line) {
    return line + Array(width - line.length + 1).join(" ");
  }

  function line_to_row(line, i) {
    function c_to_cell(c, j, line) {
      var id = coord_to_id(j, i);

      return '<td id="' + id + '">' + c + "</td>";
    }

    var cells = line.split("").map(c_to_cell);
    return "<tr>" + cells.join("") + "</tr>";
  }

  function data_to_table() {
    var rows = data.map(pad_lines).map(line_to_row);

    return "<table>\n" + rows.join("\n") + "</table>";
  }

  function pixelize() {
    // Chrome (and other browsers?) require that audio must start after user
    // action, not on page load.
    var audio;
    var osc;
    try {
      if ("AudioContext" in window) {
        audio = new AudioContext();
      } else if ("webkitAudioContext" in window) {
        audio = new webkitAudioContext();
      } else {
        throw new Error("no audio context");
      }

      if (audio) {
        osc = audio.createOscillator();
        osc.connect(audio.destination);
      } else {
        throw new Error("no audio object");
      }
    } catch (err) {
      console.log("audio error", err);
    }

    function play(x, y, s) {
      if (osc) {
        if (s != " ") {
          var c = s.charCodeAt(0);
          // http://en.wikipedia.org/wiki/Piano_key_frequencies
          var key = c % 88; // 88 keys.
          var note = Math.pow(2, (key - 49) / 12) * 440;

          // console.log('char:',s,'note:',note);
          osc.frequency.value = note;
        }
      }
    }

    function colorize() {
      function clr() {
        var n = Math.round(255 * Math.random());
        var c = n.toString(16);
        if (c.length == 1) {
          c = "0" + c;
        }
        return c;
      }
      return "#" + clr() + clr() + clr();
    }

    function toggle(x, y) {
      var id = coord_to_id(x, y);
      var e = document.getElementById(id);
      play(x, y, e.innerHTML);
      e.style.visibility = "visible";
      e.style.color = colorize();
    }

    function appear() {
      if (coords.length > 0) {
        var i = Math.round((coords.length - 1) * Math.random());
        var coord = coords[i];
        coords.splice(i, 1);
        toggle(coord.x, coord.y);
        setTimeout(appear, space);
      } else {
        if (osc) {
          osc.stop(0);
        }
        console.log("done!");
      }
    }
    if (osc) {
      osc.start(0);
    }
    setTimeout(appear, space);
  }

  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < width; j++) {
      coords.push({ x: j, y: i });
    }
  }

  function initialize() {
    document.getElementById(id).innerHTML = data_to_table();
  }

  return {
    initialize: initialize,
    pixelize: function() {
      // re-initialize in case this is a repeat click.
      // no protection from concurrent execution.
      // audio might repeatedly initialize.
      initialize();
      pixelize();
    }
  };
}
