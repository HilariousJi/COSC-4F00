"use strict";

import ListSchedule from "./ListSchedule.js";
import Course from "../Student/Course.js";
import Assignment from "../Student/Assignment.js";
import ChangePassword from "../Student/ChangePassword.js";

// What a student will see when they first sign in
export default class Student extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    this.courseHandler = this.courseHandler.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleInstructor = this.handleInstructor.bind(this);
    this.handleSubmitTime = this.handleSubmitTime.bind(this);
    this.setResetAssignments = this.setResetAssignments.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.state = {
      courses: "",
      cid: "",
      aid: "",
      resetAssignments: null,
      isVisible: {
        default: true,
        course: false,
        assignment: false,
        changePassword: false
      }
    };
  }

  // hook for children to register an update method
  setResetAssignments(f) {
    this.setState({
      resetAssignments: f
    });
  }

  // inform parent (App) of logout 
  onLogout(evt) {
    this.props.handleLogout();
  }

  // set course
  courseHandler(obj) {
    this.setState({
      courses: obj
    });
  }

  // display default Student
  handleBack() {
    this.setState({
      isVisible: {
        default: true,
        course: false,
        assignment: false,
        changePassword: false
      }
    });
  }

  // display a course or an assignment
  handleClick(type, cid, aid) {
    this.setState({
      cid: cid,
      aid: aid
    });

    if (type === "course") {
      this.setState({
        isVisible: {
          default: false,
          course: true,
          assignment: false,
          changePassword: false
        }
      });
    } else if (type === "assignment") {
      if (this.state.isVisible["assignment"] && this.state.resetAssignments !== null) {
        this.state.resetAssignments();
      }
      this.setState({
        isVisible: {
          default: false,
          course: false,
          assignment: true,
          changePassword: false
        }
      });
    }
  }

  // called from a child when info about the 
  // instructor becomes available
  handleInstructor(course) {
    let courses = this.state.courses;
    let i = 0;
    while (i < courses.length) {
      if (courses[i].id === course.id) break;
      i += 1;
    }
    courses[i] = course;
    this.setState({
      courses: courses
    });
  }

  // called from a child when info
  // about an assignment becomes available
  handleSubmitTime(submit_time, aid, cid) {
    let courses = this.state.courses;
    let c = 0;
    while (c < courses.length) {
      if (courses[c].id === cid) break;
      c += 1;
    }
    let a = 0;
    while (a < courses[c].assignments.length) {
      if (courses[c].assignments[a].id === aid) break;
      a++;
    }
    courses[c].assignments[a]["submit_time"] = submit_time;
    this.setState({
      courses: courses
    });
  }

  // show password change page
  onChangePassword(e) {
    this.setState({
      isVisible: {
        default: false,
        course: false,
        assignment: false,
        changePassword: true
      }
    });
  }

  // display
  render() {
    let course = this.state.cid === "" || this.state.cid === 0 ? null : this.state.courses.filter(c => c.id === this.state.cid)[0];
    let assignment = this.state.aid === "" || this.state.aid === 0 ? null : course.assignments.filter(a => a.id === this.state.aid)[0];
    let mainPage = null;
    if (this.state.isVisible["course"]) {
      mainPage = React.createElement(Course, { course: course, onInstructor: this.handleInstructor });
    } else if (this.state.isVisible["assignment"]) {
      mainPage = React.createElement(Assignment, {
        sid: this.props.id,
        course: course,
        assignment: assignment,
        onSubmitTime: this.handleSubmitTime,
        setReset: this.setResetAssignments
      });
    } else if (this.state.isVisible["changePassword"]) {
      mainPage = React.createElement(ChangePassword, { sid: this.props.id, goBack: this.handleBack });
    } else {
      // default
      // put some announcements or a calender or something
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        null,
        "a Student account"
      ),
      React.createElement(
        "button",
        { onClick: e => this.onChangePassword(e) },
        "change password"
      ),
      React.createElement(
        "button",
        { onClick: e => this.onLogout(e) },
        "Logout"
      ),
      React.createElement(ListSchedule, {
        onCourses: this.courseHandler,
        onClick: this.handleClick,
        id: this.props.id,
        isTeacher: "false",
        setRefresh: this.setResetAssignments
      }),
      React.createElement(
        "div",
        null,
        mainPage
      )
    );
  }
}