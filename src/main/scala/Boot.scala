
import akka.actor.{Props, ActorSystem}
import akka.io.IO
import spray.can.Http

object Boot extends App {
  implicit lazy val system = ActorSystem("spray-blog")

  import com.typesafe.config.ConfigFactory

  private val config = ConfigFactory.load
  config.checkValid(ConfigFactory.defaultReference)

  val host = config.getString("service.host")
  val portHTTP = config.getInt("service.port")
  val portWs = config.getInt("service.ports.ws")

  private val ws = new WsServer(portWs)
  val processActor = system.actorOf(Props(new ProcessActor))
  ws.forResource("/ws/script", Some(processActor))
  ws.start()

  sys.addShutdownHook({system.shutdown(); ws.stop()})

  val rootService = system.actorOf(Props(new RootService()))

  IO(Http) ! Http.Bind(rootService, interface = host, port = portHTTP)
}

