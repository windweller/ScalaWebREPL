import java.io.File

import akka.actor.{Props, ActorSystem}
import akka.io.IO
import spray.can.Http
import spray.http.MediaTypes._
import spray.routing._

object Boot extends App {
  implicit lazy val system = ActorSystem("spray-blog")

  val host = "localhost"
  val portHTTP = 8080
  val portWs = 6696

  private val ws = new WsServer(portWs)
  val processActor = system.actorOf(Props(new ProcessActor))
  ws.forResource("/ws/script", Some(processActor))
  ws.start()

  sys.addShutdownHook({system.shutdown(); ws.stop()})

  val rootService = system.actorOf(Props(new RootService()))

  IO(Http) ! Http.Bind(rootService, interface = host, port = portHTTP)
}