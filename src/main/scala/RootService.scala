
import java.io.File

import akka.actor._
import spray.http.MediaTypes._
import spray.http.StatusCodes._
import spray.httpx.encoding.Gzip
import spray.routing._
import spray.http.StatusCodes
import spray.httpx.SprayJsonSupport._
import spray.routing.RequestContext
import akka.util.Timeout
import scala.concurrent.duration._

class RootService() extends HttpServiceActor with RestApi{
  def receive = runRoute(routes)
}

trait RestApi extends HttpService with ActorLogging {
  actor: Actor =>

  implicit val timeout = Timeout(10 seconds)

  def routes: Route =
    pathEndOrSingleSlash {
      getFromFile(new File("views/slides.html"), `text/html`)
    } ~
    path(Rest) { filePath =>
      get {
        println(filePath)
        compressResponse(Gzip) {
          getFromFile(new File("views/"+filePath))
        }
      }
    }
}