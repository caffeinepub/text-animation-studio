import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type TextSegment = {
    content : Text;
    startTimeMs : Nat;
    durationMs : Nat;
    animationPreset : Text;
    transitionEffect : Text;
    soundEffect : Text;
    styleOverrides : Text; // JSON string
  };

  type StyleSettings = {
    fontFamily : Text;
    fontSize : Nat;
    textColor : Text;
    backgroundColor : Text;
    shadow : Bool;
    outline : Bool;
  };

  type AnimationProject = {
    title : Text;
    textSegments : [TextSegment];
    styleSettings : StyleSettings;
    createdAt : Time.Time;
  };

  module AnimationProject {
    public func compare(p1 : AnimationProject, p2 : AnimationProject) : Order.Order {
      Text.compare(p1.title, p2.title);
    };
  };

  let projects = Map.empty<Text, AnimationProject>();

  public shared ({ caller }) func createProject(
    title : Text,
    textSegments : [TextSegment],
    styleSettings : StyleSettings
  ) : async () {
    if (projects.containsKey(title)) {
      Runtime.trap("Project with this title already exists");
    };

    let newProject : AnimationProject = {
      title;
      textSegments;
      styleSettings;
      createdAt = Time.now();
    };

    projects.add(title, newProject);
  };

  public query ({ caller }) func getProject(title : Text) : async AnimationProject {
    switch (projects.get(title)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) { project };
    };
  };

  public query ({ caller }) func listProjects() : async [AnimationProject] {
    projects.values().toArray();
  };

  public shared ({ caller }) func updateProject(
    title : Text,
    newTextSegments : [TextSegment],
    newStyleSettings : StyleSettings
  ) : async () {
    switch (projects.get(title)) {
      case (null) { Runtime.trap("Project not found") };
      case (?existingProject) {
        let updatedProject : AnimationProject = {
          title;
          textSegments = newTextSegments;
          styleSettings = newStyleSettings;
          createdAt = existingProject.createdAt;
        };
        projects.add(title, updatedProject);
      };
    };
  };

  public shared ({ caller }) func deleteProject(title : Text) : async () {
    switch (projects.get(title)) {
      case (null) { Runtime.trap("Project not found") };
      case (?_) {
        projects.remove(title);
      };
    };
  };
};
