import h from '../bower_components/siimple-elements/src/hyperscript.js';
import SiimpleAlert from '../bower_components/siimple-elements/src/elements/alert.js';
//Toast class
export default class Toast extends React.Component
{
  //Constructor
  constructor(props)
  {
    //Call super method
    super(props);
    this.state = {
      color: "blue",
      text: "Placeholder",
      time: 5000,
      display: false,
    };

    this.timer = null;

    this.displayDone = this.displayDone.bind(this);
    this.displayWarning = this.displayWarning.bind(this);
    this.displayError = this.displayError.bind(this);
    this.close = this.close.bind(this);
  }

  close()
  {
    clearTimeout(this.timer);
    this.setState({ display: false});
  }

  display(color, text, time)
  {
    this.setState({ color: color, text: text, time: time, display: true}, function()
    {
      if(this.timer)
      {
        clearTimeout(this.timer);
      }

      if(this.state.time !== -1)
      {    
        this.timer = setTimeout(this.close, this.state.time);
      }

    });
    
  }

  displayDone(text, time)
  {
    this.display("green", text, time);
  }

  displayWarning(text, time)
  {
    this.display("yellow", text, time);
  }

  displayError(text, time)
  {
    this.display("red", text, time);
  }

  render()
  {
    var children = [];

    children.push(h(SiimpleAlert, { color: this.state.color, showCloseButton: true, onClose: this.close}, this.state.text));

    var myclass = [ 'mytoast' ];

    if(this.state.display === true)
    {
      myclass.push('up');
    }

    return h.div({ className: myclass }, children);
  }
}
