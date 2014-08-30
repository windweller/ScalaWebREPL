import akka.actor.{ActorLogging, Actor}
import org.java_websocket.WebSocket
import WsServerMsg._
import scala.tools.nsc._
import scala.tools.nsc.interpreter._
import java.io.{File, PrintWriter}

import scala.collection.mutable.ListBuffer

class ProcessActor extends Actor with ActorLogging {

  import ProcessActorMsg._

  val clients = ListBuffer[WebSocket]()

  def receive = {
    case Open(ws, hs) =>
      clients += ws

    case Message(ws, msg) =>
      import scala.tools.nsc.interpreter.Results.{Success, Error, Incomplete}

      log.debug("url {} received msg '{}'", ws.getResourceDescriptor, msg)
      //work here to execute

      val settings = new Settings
      settings.bootclasspath.value +=scala.tools.util.PathResolver.Environment.javaBootClassPath + File.pathSeparator + "lib/scala-library.jar"
      val writer = new java.io.StringWriter()
      val i = new IMain(settings, new PrintWriter(writer)) {
        override protected def parentClassLoader = settings.getClass.getClassLoader
      }

      val ir = i.interpret(msg) //saved to result.txt

      ir match {
        case Success => ws.send(writer.toString)
        case Error => ws.send("error in: '" + msg + "'\n" + writer.toString)
        case Incomplete => ws.send("incomplete in :'" + msg + "'\n" + writer.toString)
      }

    case Close(ws, code, reason, ext) => self ! Unregister(ws)
    case Error(ws, ex) => self ! Unregister(ws)

    case Unregister(ws) =>
      if (null != ws) {
        log.debug("unregister monitor")
        clients -= ws
      }

  }
}

object ProcessActorMsg {
  case class Unregister(ws : WebSocket)
}