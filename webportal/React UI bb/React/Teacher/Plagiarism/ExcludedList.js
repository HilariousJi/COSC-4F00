"use strict";

// Display a list of files to exclude / ignore from plagiarism detection

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

export default class ExcludedList extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    this.state = {
      excluded: []
    };
  }

  // get list of files only after component mount
  componentDidMount() {
    this.getCluded().then(res => {
      // excluded: Array.from(res.exclude),
      this.setState({
        excluded: res
      });
    }).catch(err => console.log(err));
  }

  // call the backend
  getCluded() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const response = yield fetch("./api.php/excluded/" + _this.props.cid + "/" + _this.props.aid);
      if (response.status !== 200) throw Error(response.status + ", " + response.statusText);
      const body = yield response.json();
      return body;
    })();
  }

  // display
  render() {
    let excluded_blurb = "No files to exclude";
    let excluded = this.state.excluded;
    let jsx = "";
    if (excluded) {
      if (this.props.deleteAll) {
        excluded.length = 0;
      } else if (this.props.addFile) {
        if (!excluded.includes(this.props.addFile)) {
          excluded.push(this.props.addFile);
        }
      }
      excluded_blurb = excluded.length + " excluded files";
      jsx = excluded.map(n => React.createElement(
        "li",
        { key: n },
        n
      ));
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        null,
        excluded_blurb
      ),
      React.createElement(
        "ul",
        null,
        jsx
      )
    );
  }
}