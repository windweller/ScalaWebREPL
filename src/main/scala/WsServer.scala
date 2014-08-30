import org.java_websocket.WebSocket
import org.java_websocket.handshake.ClientHandshake
import org.java_websocket.server.WebSocketServer
import java.net.InetSocketAddress
import akka.actor.ActorRef
import org.java_websocket.framing.CloseFrame


class WsServer (val port: Int) extends WebSocketServer(new InetSocketAddress(port)) {

  private var reactors = Map[String, ActorRef]()
  final def forResource(descriptor : String, reactor : Option[ActorRef]) {
    reactor match {
      case Some(actor) => reactors += ((descriptor, actor))
      case None => reactors -= descriptor
    }
  }

  override def onOpen(ws: WebSocket, hs: ClientHandshake): Unit = {
    if (null != ws) {
      reactors.get(ws.getResourceDescriptor) match {
        case Some(actor) => actor ! WsServerMsg.Open(ws, hs)
        case None => ws.close(CloseFrame.REFUSE)
      }
    }
  }

  override def onError(ws: WebSocket, ex: Exception): Unit = {
    if (null != ws) {
      reactors.get(ws.getResourceDescriptor) match {
        case Some(actor) => actor ! WsServerMsg.Error(ws, ex)
        case None => ws.close(CloseFrame.REFUSE)
      }
    }
  }

  override def onMessage(ws: WebSocket, msg: String) {
    if (null != ws) {
      reactors.get(ws.getResourceDescriptor) match {
        case Some(actor) => actor ! WsServerMsg.Message(ws, msg)
        case None => ws.close(CloseFrame.REFUSE)
      }
    }
  }

  override def onClose(ws: WebSocket, code: Int, reason: String, remote: Boolean): Unit = {
    if (null != ws) {
      reactors.get(ws.getResourceDescriptor) match {
        case Some(actor) => actor ! WsServerMsg.Close(ws, code, reason, remote)
        case None => ws.close(CloseFrame.REFUSE)
      }
    }
  }
}

object WsServerMsg {
  sealed trait ReactiveServerMessage
  case class Message(ws : WebSocket, msg : String)
    extends ReactiveServerMessage
  case class Open(ws : WebSocket, hs : ClientHandshake)
    extends ReactiveServerMessage
  case class Close(ws : WebSocket, code : Int, reason : String, external : Boolean)
    extends ReactiveServerMessage
  case class Error(ws : WebSocket, ex : Exception)
    extends ReactiveServerMessage
}