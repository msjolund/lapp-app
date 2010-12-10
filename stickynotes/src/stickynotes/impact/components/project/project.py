# coding=UTF-8
from impact.api import *
from stickynotes.impact.components.user.user import User

class Note(Model):
    id = t.Primary()
    body = t.Text
    columnId = t.Key
    estimate = t.Int


@dashboard.model()
class Column(Model):
    id = t.Primary()
    name = t.String
    notes = hasMany(Note, "Column.id", "Note.columnId")
    boardId = t.Key

@dashboard.model()
class Board(Model):
    id = t.Primary()
    name = t.String()
    columns = hasMany(Column, "Board.id", "Column.boardId")
    projectId = t.Key()

@dashboard.model()
class Project(Model):
    id = t.Primary
    name = t.String
    boards = hasMany(Board, "Board.projectId")

class UserProject(Model):
    id = t.Primary()
    userId = t.Key()
    user = hasOne(User, "UserProject.userId")
    projectId = t.Key()
    project = hasOne(Project, "UserProject.projectId")



#class Project(Model):
#    id = t.Primary
#    notes = hasMany(Sprint, "Sprint.projectId")

class ProjectService(Service):
    Crud.addAll(Note)
    Crud.addAll(Board)
    Crud.addAll(Column)
    Crud.addAll(Project)

    @returns({t.Int: [Note]})
    def noteGetAll():
        notes = Query(Note).getAll()
        cols = {1: [], 2: [], 3: []}
        for note in notes:
            if not note.column in cols:
                cols[note.column] = []
            cols[note.column].append(note)
        return cols

    @params(t.Key, t.Text, t.Int)
    @returns(Note)
    def noteEdit(id, body, estimate):
        note = Note()
        note.id = id
        note.body = body
        note.estimate = estimate
        Query.update(note)
        note = Query(Note).get(id)
        return note

    @params(t.Key, t.Key)
    @returns(Note)
    def noteUpdateColumn(id, col):
        note = Note()
        note.id = id
        note.columnId = col
        Query.update(note)
        note = Query(Note).get(id)
        return note

    @params(t.Key)
    @returns(Column)
    def columnGet(id):
        col = Query(Column).get(id)
        return col

    @params(t.Key)
    @returns(Project)
    def projectGet(id):
        project = Query(Project).get(id)
        return project

    @params([t.Key])
    @returns([Board])
    def findBoardsByProjectIds(ids):
        return Query(Board).filter(projectId=ids).getAll()

    @params(t.Key)
    @returns(Board)
    def boardGetFull(id):
        board = Query(Board).get(id)
        loadAll(board)
        return board

    @params(t.Key, t.String)
    @returns(Board)
    def boardCreateRich(projectId, name):
        services.ProjectService().projectGet(projectId)
        board = Board()
        board.name = name
        board.projectId = projectId
        Query.save(board)

        for name in ["To do", "In Progress", "Done"]:
            col = Column()
            col.name = name
            col.boardId = board.id
            services.ProjectService().columnCreate(col)

        return board