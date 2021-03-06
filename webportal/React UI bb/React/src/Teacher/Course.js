"use strict";

import CreateAssignment from "./CreateAssignment.js";
import EditCourseInfo from "./EditCourseInfo.js";
import EnrolledList from "./EnrolledList.js";

// Display information about a course, allow some modifications to it

export default class Course extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    this.resetVisible = this.resetVisible.bind(this);
    this.state = {
      isVisible: {
        default: true,
        createAssignment: false,
        editInfo: false,
      }
    };
    this.props.setReset(this.resetVisible);
  }

  // display default
  resetVisible() {
    this.setState({
      isVisible: {
        default: true,
        createAssignment: false,
        editInfo: false,
      }
    });
  }

  // show EditCourseInfo component
  onEditInfo(e) {
    this.setState({
      isVisible: {
        default: false,
        createAssignment: false,
        editInfo: true,
      }
    });
  }

  // show CreateAssignment component
  onCreateNewAssignment(e) {
    this.setState({
      isVisible: {
        default: false,
        createAssignment: true,
        editInfo: false,
      }
    });
  }

  // TODO
  onReviewPlagiarism(e) {
    console.log("review plagiarism");
  }

  // display
  render() {
    // need to know:
    // what plagiarism reports are available
    let assList = this.props.course["assignments"].map(assignment => (
      <li key={assignment.id}>
        <span>{"id: " + assignment.id + ", name: " + assignment.name}</span>
      </li>
    ));

    let display = null;
    if (this.state.isVisible["default"]) {
      display = (
        <div>
          <button onClick={e => this.onEditInfo(e)}>Edit info</button>
          <button onClick={e => this.onCreateNewAssignment(e)}>
            Create new assignment
          </button>
          <button onClick={e => this.onReviewPlagiarism(e)}>
            Review plagiarism reports (for the entire course)
          </button>
          <p>id: {this.props.course.id}</p>
          <p>description: {this.props.course.description}</p>
          <p>year: {this.props.course.year}</p>
          <p>semester: {this.props.course.semester}</p>
          <ul>{assList}</ul>
          <p>List of Enrolled students</p>
          <EnrolledList
            course={this.props.course}
            updateEnrolled={this.props.updateEnrolled}
          />
        </div>
      );
    } else if (this.state.isVisible["createAssignment"]) {
      display = (
        <CreateAssignment
          goBack={this.resetVisible}
          cid={this.props.course.id}
          refreshList={this.props.refreshList}
        />
      );
    } else if (this.state.isVisible["editInfo"]) {
      display = <EditCourseInfo goBack={this.resetVisible} />;
    }

    return (
      <div>
        <h3>a Course</h3>
        <p>code: {this.props.course.code}</p>
        <p>name: {this.props.course.name}</p>
        {display}
      </div>
    );
  }
}
